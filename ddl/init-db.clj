(require '[clojure.java.jdbc :as sql])
(sql/with-connection
  {:classname "org.h2.Driver"
   :subprotocol "h2:file"
   :subname "db/region-investigation-admin"}

  (sql/create-table :locations
    [:id "bigint primary key auto_increment"]
    [:x "integer"]
    [:y "integer"])

  (sql/insert-records :locations
    {:x 8 :y 9}))
