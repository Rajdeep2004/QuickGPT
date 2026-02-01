import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";

//Text based AI chat MeSsage Controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "not enoughcredits for image generation",
      });
    }
    const { chatId, prompt } = req.body;
    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();
    return res.json({ success: true, reply });
    await User().updateOne({ _id: userId }, { $inc: { credits: 0 } });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//image generation message controller

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    //check credits

    const { prompt, chatId, isPublished } = req.body;
    //find chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    //push user message to chat
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
    //encode this prompt
    const encodedPrompt = encodeURIComponent(prompt);

    //constract image kit  ai generation url
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    //trigger image greneration by requesting url
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    //convert to base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    //upload to image kit media libarary
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    //reply message
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };
    res.json({ success: true, reply });

    //puch reply to the message in chat
    chat.messages.push(reply);
    await chat.save();
    //deduct credits
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
