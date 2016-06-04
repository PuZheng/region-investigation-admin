(ns region-investigation-admin.poi_type
  (:require
    [compojure.core :refer :all]
    [cheshire.core :refer [parse-string generate-string]]
    [ring.util.response :as response]
    [clojure.java.io :as io]
    [region-investigation-admin.config :as config]
    [me.raynes.fs :as fs]
    [ring.middleware.multipart-params :refer [wrap-multipart-params]]
    [me.raynes.fs.compression :as compression])
  (:import (java.util Date)
           (java.text SimpleDateFormat)))

(def poi-type-dir (io/file config/upload-dir "poi-types"))
(io/make-parents (io/file poi-type-dir "foo"))

(defn read-file [file]
  (with-open [reader (io/input-stream file)]
    (let [length (.length (io/file file))
          buffer (byte-array length)]
      (.read reader buffer 0 length)
      buffer)))

(defroutes poi-type-routes
  (context "/poi-type" []
           (wrap-multipart-params 
             (PUT "/object/:org-code/:name" {params :params}
                  (let [org-code (params :org-code)
                        name_ (params :name)
                        dir (io/file poi-type-dir (params :org-code) (params :name))
                        fields (params :fields)
                        ic (params :ic)
                        ic-active (params :ic_active)
                        config-file (io/file dir "config.json")
                        sdf (new SimpleDateFormat "yyyyMMddHHmmss")]
                   (if (.exists dir)
                     (response/response 
                       (do (if (not (nil? fields))
                          (spit config-file
                                (generate-string 
                                  {
                                   :name name_
                                   :timestamp (.format sdf (new Date)) 
                                   :fields (parse-string (params :fields))
                                   :uuid (java.util.UUID/randomUUID)
                                   }
                                  )))
                        (if (not (nil? ic)) (io/copy (ic :tempfile) (io/file dir "ic.png")))
                        (if (not (nil? ic-active)) (io/copy (ic-active :tempfile) (io/file dir "ic_active.png")))
                        {}))
                     (response/status (response/response {
                                                          :name "不存在该信息点类型"
                                                          }) 403)))))
           (wrap-multipart-params 
             (POST "/object" {params :params}
                   (let [org-code (params :org_code)
                         name_ (params :name)]
                     (if (fs/exists? (io/file poi-type-dir org-code name_))
                       (response/status 
                         (response/response {
                                             :name "已经存在该信息点类型"      
                                             }) 403)
                       (response/response 
                         (let [dir (io/file poi-type-dir org-code name_) 
                               config-file (io/file dir "config.json")
                              sdf (new SimpleDateFormat "yyyyMMddHHmmss") ]
                           (io/make-parents config-file)
                           (spit config-file 
                                 (generate-string 
                                   {
                                    :name name_
                                    :timestamp (.format sdf (new Date)) 
                                    :fields (parse-string (params :fields))
                                    :uuid (java.util.UUID/randomUUID)
                                    }))
                           (io/copy ((params :ic) :tempfile) (io/file dir "ic.png"))
                           (io/copy ((params :ic_active) :tempfile) (io/file dir "ic_active.png"))
                           {}))))
                   ))
           (GET "/latest-versions" {params :query-params}
                (response/response (let [org-code (params "org_code")]
                                     {:data (map (fn [dir] {
                                                            :name      (.getName dir)
                                                            :timestamp ((parse-string (slurp (io/file dir "config.json")))
                                                                        "timestamp")
                                                            })
                                                 (filter fs/directory? (fs/list-dir (io/file poi-type-dir org-code))))}
                                     )))
           (GET "/:org-code/:name_.zip" [org-code name_]
                (response/header
                  (response/file-response
                    (let [timestamp ((parse-string (slurp (io/file poi-type-dir org-code name_ "config.json")))
                                     "timestamp")
                          zipFile (io/file poi-type-dir org-code (str name_ "-" timestamp ".zip"))]
                      (if (not (fs/exists? zipFile))
                        (compression/zip zipFile
                                         ; don't use slurp to read binary data
                                         (map (fn [f] [(.getName f) (read-file f)])
                                              (filter fs/file? (fs/list-dir (io/file poi-type-dir org-code name_))))))
                      (.getPath (io/file poi-type-dir org-code (str name_ "-" timestamp ".zip")))))
                  "content-disposition" (str "attachment; filename=\"" name_ "\"")))
           )
  )
