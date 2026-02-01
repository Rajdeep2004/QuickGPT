import Chat from "../models/Chat.js";

//Api controller for chatiing with ai
export const createChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
      userName: req.user.name,
    };
    await Chat.create(chatData);
    res.json({ success: true, message: "Chat Created" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//api controller for getting all chats
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//api controller for deleting chats
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const { chatId } = req.body;
    await Chat.deleteOne({ _id: chatId, userId });

    res.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
