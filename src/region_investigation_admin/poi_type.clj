(ns region-investigation-admin.poi_type
  (:require
    [compojure.core :refer :all]
    [cheshire.core :refer [parse-string]]
    [ring.util.response :as response]
    [clojure.java.io :as io]
    [region-investigation-admin.config :as config]
    [me.raynes.fs :as fs]
    [me.raynes.fs.compression :as compression]))

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
             (GET "/latest-versions" {params :query-params}
               (response/response (let [orgCode (params "org_code")]
                                    {:data (map (fn [dir] {
                                                           :name      (.getName dir)
                                                           :timestamp ((parse-string (slurp (io/file dir "config.json")))
                                                                        "timestamp")
                                                           })
                                                (filter fs/directory? (fs/list-dir (io/file poi-type-dir orgCode))))}
                                    )))
             (GET "/:orgCode/:name_.zip" [orgCode name_]
               (response/header
                 (response/file-response
                   (let [timestamp ((parse-string (slurp (io/file poi-type-dir orgCode name_ "config.json")))
                                     "timestamp")
                         zipFile (io/file poi-type-dir orgCode (str name_ "-" timestamp ".zip"))]
                     (if (not (fs/exists? zipFile))
                       (compression/zip zipFile
                                        ; don't use slurp to read binary data
                                        (map (fn [f] [(.getName f) (read-file f)])
                                             (filter fs/file? (fs/list-dir (io/file poi-type-dir orgCode name_))))))
                     (.getPath (io/file poi-type-dir orgCode (str name_ "-" timestamp ".zip")))))
                 "content-disposition" (str "attachment; filename=\"" name_ "\"")))
             )
  )
