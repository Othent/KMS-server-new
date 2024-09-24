// `process.loadEnvFile('.env')` doesn't seem to work when running tests with Jest, so we still need to use `dotenv`
// for testing:
require("dotenv").config();
