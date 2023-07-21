// import type { MailgunMessageData } from "mailgun.js/interfaces/Messages";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { NextApiRequest, NextApiResponse } from "next";

import { getAccountResource } from "../../../lib/services";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

const CORE_CODE_ADDRESS = "0x1";
const RPC_URL = process.env.API_URL_MAINNET || "";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  let current_epoch_successful_proposals = 0;
  let current_epoch_failed_proposals = 0;
  const pool =
    "0x9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda";

  const [validatorSet, validatorPerformances] = await Promise.all([
    getAccountResource(RPC_URL, CORE_CODE_ADDRESS, "0x1::stake::ValidatorSet"),
    getAccountResource(
      RPC_URL,
      CORE_CODE_ADDRESS,
      "0x1::stake::ValidatorPerformance"
    ),
  ]);
  console.log("validator~", validatorPerformances);
  const validator = validatorSet.data.active_validators.find(
    (validator: any) => validator.addr === pool
  );
  if (!validator) {
    return response.status(500).json({
      error:
        "Validator not found at that address. Check your selected nework and address",
    });
  }

  const validator_index = Number(validator.config.validator_index);
  const currentEpochPerformance =
    validatorPerformances.data.validators[validator_index];
  current_epoch_successful_proposals = Number(
    currentEpochPerformance["successful_proposals"]
  );
  current_epoch_failed_proposals = Number(
    currentEpochPerformance["failed_proposals"]
  );
  console.log(
    "success~",
    current_epoch_successful_proposals,
    current_epoch_failed_proposals
  );
  const messageData = {
    from: "BNBCalc <hello@bnbcalc.com>",
    to: "dconroy@gmail.com",
    bcc: "hello@bnbcalc.com",
    subject: "Your Aptos validator performance",
    text: `Hello, you have ${current_epoch_failed_proposals} failed proposals and ${current_epoch_successful_proposals}.`,
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    // "h:Reply-To": "reply-to@example.com",
  };
  try {
    await mg.messages.create("bnbcalc.com", messageData);
    return response.status(200).json({
      success: true,
    });
  } catch (e) {
    return response.status(404).json({ success: false, msg: e });
  }

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}
