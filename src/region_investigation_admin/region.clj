(ns region-investigation-admin.region
  (:require
    [compojure.core :refer :all]
    [ring.middleware.multipart-params :refer [wrap-multipart-params]]
    [ring.util.response :as response]
    [me.raynes.fs :as fs]
    [region-investigation-admin.config :refer [upload-dir]]
    [clojure.java.io :as io]))

(def region-dir (io/file upload-dir "regions/"))
(io/make-parents (io/file region-dir "foo"))

(defroutes region-routes
  (context "/region" []
           (GET "/accounts" []
                (response/response 
                  {
                   :data (flatten (map 
                                    (fn [orgDir] (map (fn [accountDir] {
                                                                        :orgCode (.getName orgDir)
                                                                        :username (.getName accountDir)
                                                                        }) (fs/list-dir orgDir))) 
                                    (fs/list-dir (io/file region-dir))))
                   }
                  ))
           (GET "/list" {params :query-params}
                (response/response 
                  (let [orgCode (params "org_code")
                        username (params "username")] 
                    {
                     :data (map #(.getName %) (fs/list-dir (io/file region-dir orgCode username)))
                     })
                  ))
           (wrap-multipart-params (POST "/object" {params :params}
                                        (response/response
                                          (let [orgCode (params :orgCode)
                                                username (params :username)
                                                file (params :file)
                                                dest (io/file region-dir orgCode username (file :filename))]
                                            (io/make-parents dest)
                                            (io/copy (file :tempfile) dest)
                                            {}
                                            ))))
           )
  )

