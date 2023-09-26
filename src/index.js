const cron = require('node-cron');
const fs = require('fs');
const yaml = require("js-yaml");
const {scraper} = require('./scraper')

const startCron = async () =>{
    try {
        let config = yaml.load(fs.readFileSync("./config.yml"));
        let minutes = config.REAPET_EVERY_X_MINUTES
        console.log('Starting cron')
        const job = cron.schedule(`* */${minutes} * * * *`, () => {
            scraper(config)
            console.log(`Eseguito ogni ${minutes} minuti`);
          });
          job.start()
        
    } catch (error) {
        console.log(error)
    }
}

startCron()