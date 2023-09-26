const axios = require("axios");
const himalaya = require("himalaya");
const fs = require("fs");
const passwordGenerator = require("password-generator");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

exports.fetchDataAsJson = async (url) => {
  try {
    let response = await axios.get(url);
    if (response.status != 200) {
      throw new Error(
        `Error while fetching data. Status code: ${response.status}`
      );
    }
    let dataAsJson = await himalaya.parse(response.data);

    let elements =
      dataAsJson[2].children[3].children[10].children[1].children[1].children[1]
        .children[3].children[3].children;
    console.log(elements.length);
    return elements;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.processData = async (redis, config, list) => {
  try {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (i % 2 != 0) {
        let newKey = {};
        let threat = list[i].children[1].children[0].content;
        console.log(threat);
        let alreadyExists = await redis.hget(config.MALWARE_KEY, threat);
        if (!alreadyExists) {
          let downloadUrl = list[i].children[3].children[0].attributes[0].value;
          let password = passwordGenerator(
            12,
            false,
            /[a-zA-Z0-9!@#$%^*()_+{}[\]:;<>,.?~]/
          );
          console.log("password: " + password);
          newKey.threat = threat;
          newKey.sha256 = list[i].children[5].children[1].children[0].content;
          newKey.localPath = config.DOWNLOAD_DIR + newKey.sha256 + ".zip";
          newKey.password = password;
          let downloadResult = await this.downloadFile(
            downloadUrl,
            newKey,
            config
          );
          if (downloadResult == "done") {
            if (fs.existsSync(newKey.localPath)) {
              fs.unlinkSync(newKey.sha256);
            }
            console.log("download of " + threat + " " + downloadResult);
          } else {
            newKey.downloadError = downloadResult;
            console.log(
              "Error: " +
                JSON.stringify(downloadResult) +
                " occurred during the download of sample for: " +
                threat
            );
          }
          await this.insertRecordIntoDB(redis, config, newKey);
          count++;
        }
      }
    }
    redis.hset(config.COUNT_KEY, new Date(), count);
    console.log(count);
    return;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.downloadFile = async (url, newKey, config) => {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
    });

    console.log("Status code:", response.status);

    if (response.status !== 200) {
      throw new Error(
        `Errore durante il download. Codice di stato: ${response.status}`
      );
    }

    fs.writeFileSync(newKey.sha256, Buffer.from(response.data));
    if (!fs.existsSync(config.DOWNLOAD_DIR)) {
      fs.mkdirSync(config.DOWNLOAD_DIR);
    }
    await exec(
      `7z a -p${newKey.password} ${newKey.localPath} ${newKey.sha256}`
    );

    return "done";
  } catch (error) {
    console.error(
      "Si è verificato un errore durante il download del file:",
      error
    );
    return error;
  }
};

exports.insertRecordIntoDB = async (redis, config, record) => {
  try {
    let hash = config.MALWARE_KEY;
    let value = JSON.stringify(record);

    await redis.hset(hash, record.threat, value, (error, result) => {
      if (error) {
        console.error("Errore:", error);
        throw error;
      } else {
        console.log("Risultato:", result);
        return result;
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
