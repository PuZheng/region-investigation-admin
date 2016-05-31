(defproject region-investigation-admin "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :min-lein-version "2.0.0"
  :dependencies [
                 [org.clojure/clojure "1.7.0"]
                 [compojure "1.4.0"]
                 [ring/ring-defaults "0.1.5"]
                 [ring/ring-json "0.4.0"]
                 [lib-noir "0.9.9"]
                 [selmer "1.0.4"]
                 [ring/ring-json "0.4.0"]
                 [jarohen/nomad "0.7.2"]
                 [clj-time "0.11.0"]
                 [me.raynes/fs "1.4.6"]
                 [ring.middleware.logger "0.5.0"]
                 [cheshire "5.6.1"]
                 ]
  :plugins [[lein-ring "0.9.7"]
            [lein-iclojure "1.2"]
            [jonase/eastwood "0.2.3"]]
  :ring {:handler region-investigation-admin.handler/reloadable-app}
  :mirrors {"central" {:name "central"
                       :url "http://jcenter.bintray.com/"}}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring/ring-mock "0.3.0"]]}})
