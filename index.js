const { Requester, Validator } = require('@chainlink/external-adapter')


const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
};

const customParams = {
  city: ['city', 'q', 'town'],
  endpoint: true
};

exports.createRequest = async (input, callback) => {
  const validator = new Validator(input, customParams, callback);
  const jobRunID = validator.validated.id

  try{
    const endpoint = validator.validated.data.endpoint || 'weather';
    const q = validator.validated.data.city;
    const appId = process.env.API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${q}&appid=${appId}`;
    const config = {
      url
    };

    const response = await Requester.request(config, customError);
    response.data.result = Requester.validateResultNumber(response.data, ['main', 'temp']);

    callback(response.status, Requester.success(jobRunID, response));
  } catch (err) {
    console.log(err);
    callback(500, Requester.errored(jobRunID, err))
  }
};
