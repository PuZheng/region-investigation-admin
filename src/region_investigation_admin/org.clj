(ns region-investigation-admin.org
  (:require
    [compojure.core :refer :all]
    [cheshire.core :refer [parse-string generate-string]]
    [ring.util.response :as response]
    [region-investigation-admin.config :refer [upload-dir]]
    [clojure.java.io :as io]))

(defroutes org-routes
           (context "/org" []
                    (POST "/" {params :body}
                      (let [file (io/file upload-dir "orgs.json")
                            orgs (if (.exists file) (parse-string (slurp file)) [])
                            code (params "code")
                            name (params "name")]
                        (if (some (fn [org] (= (org "code") code)) orgs)
                          (response/status (response/response {
                                                               :code (str "机构代码" code "已经存在")
                                                               }) 403)

                          (response/response
                            (do
                              (spit (io/file upload-dir "orgs.json") (generate-string
                                                                       (concat orgs [{
                                                                                      :code code
                                                                                      :name name
                                                                                      }])))
                              {})

                            )
                          )
                        )
                      )))
