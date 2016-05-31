(ns region-investigation-admin.region
  (:require
    [compojure.core :refer :all]
    [ring.middleware.multipart-params :refer [wrap-multipart-params]]
    [ring.util.response :as response]
    [region-investigation-admin.config :refer [upload-dir]]
    [clojure.java.io :as io]))

(def region-dir (io/file upload-dir "regions/"))
(io/make-parents (io/file region-dir "foo"))

(defroutes region-routes
           (context "/region" []
             (wrap-multipart-params (POST "/" {params :params}
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

