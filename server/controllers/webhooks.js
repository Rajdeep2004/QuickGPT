import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`webhook Error:${error.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        const session = sessionList.data[0];
        const { transactionId, appId } = session.metadata;

        if (appId === "QuickGPT") {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          });

          //update credits on user account
          await User.updateOne(
            { _id: transaction.userId },
            { $inc: { credits: transaction.credits } },
          );
          //update transiction status
          transaction.isPaid = true;
          //await TranscriptionSessions.save();
          await transaction.save();
        } else {
          return response.json({
            success: false,
            message: "Ignored event:Invalid app ",
          });
        }
        break;
      }
      default:
        console.log("Unhandled event Type:", event.type);
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.log("web hook processing error ", error);
    res.status(400).send("internal server error on payment");
  }
};
