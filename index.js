const { Requester, Validator } = require('@chainlink/external-adapter');


const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
};

const customParams = {
  start_date: true,
  end_date: true,
  endpoint: true,
  sort: false,
  putcountpercent_gte: false,
  limit: false,
  key: true,
  subKey: true,
};

exports.createRequest = async (input, callback) => {
  const validator = new Validator(input, customParams, callback);
  const jobRunID = validator.validated.id

  try{
    const endpoint = validator.validated.data.endpoint;
    const start_date = validator.validated.data.start_date;
    const end_date = validator.validated.data.end_date;
    const limit = validator.validated.data.limit;
    const sort = validator.validated.data.sort;
    const putcountpercent_gte = validator.validated.data.putcountpercent_gte;
    const key = validator.validated.data.key;
    const subKey = validator.validated.data.subKey;

    const url = `https://www.finlytica.com/${endpoint}?`;

    const params = {
      start_date,
      end_date
    };

    if(limit) params.limit = limit;
    if(sort) params.limit = sort;
    if(putcountpercent_gte) params.limit = putcountpercent_gte;

    const tokenConfig = {
      method: 'post',
      url: 'https://www.finlytica.com/auth/local',
      data: {
        identifier: process.env.identifier,
        password: process.env.password,
      }
    };
    const token = await Requester.request(tokenConfig, customError);

    const config = {
      url,
      params,
      headers: {
        Authorization: `Bearer ${token.data.jwt}`
      }
    };

    const response = await Requester.request(config, customError);
    response.data.result = Requester.validateResultNumber(response.data, [key, subKey]);

    callback(response.status, Requester.success(jobRunID, response));
  } catch (err) {
    console.log(err);
    callback(500, Requester.errored(jobRunID, err))
  }
};
