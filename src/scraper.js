const fs = require("fs");
const yaml = require("js-yaml");
const Redis = require("ioredis");
const { fetchDataAsJson, processData} = require("./functions");

const scraper = async (config) => {
  let redis;
  try {
    let url = config.URL
    redis = new Redis({
      host: config.DB.HOSTNAME,
      port: config.DB.PORT,
      password: process.env.REDIS_PASSWORD,
      db: config.DB.DB_NUM, 
    });

    console.log(url);
    let elementList = await fetchDataAsJson(url);
    await processData(redis, config, elementList)
  } catch (error) {
    console.log(error);
  } finally {
    redis.quit();
  }
};

scraper(yaml.load(fs.readFileSync('./config.yml')));
