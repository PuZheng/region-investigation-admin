(ns region-investigation-admin.config
  (:require
    [nomad :refer [defconfig]]
    [clojure.java.io :as io]))

(defconfig my-config (io/resource "config.edn"))

(def upload-dir (io/file (let [v ((my-config) :upload-dir)] (if (nil? v) "assets" v)) ))
