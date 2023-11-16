const { Notification } = require('../models/notification.model')
const { convertToObjectMongo } = require('../utils')

class NotificationService {
  static async createMessage({ sendId, receiverId, type, content, url }) {
    const newNoti = await Notification.create({
      noti_type: type,
      noti_content: content,
      noti_senderId: sendId,
      noti_receiverId: receiverId,
      noti_url: url,
    })

    return newNoti
  }

  static async listNotiByUser({
    userId,
    type,
    isRead = 0,
    limit = 30,
    page = 1,
  }) {
    const match = {
      noti_receiverId: convertToObjectMongo(userId),
    }
    if (type) {
      match['noti_type'] = type
    }
    if (isRead) {
      match['noti_isRead'] = isRead
    }
    let result = await Notification.find(match)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('noti_senderId', 'name avatar')
      .sort({ createdAt: -1 })

    return result
  }

  static async getNotification({ notiId }) {
    return await Notification.findById(notiId).populate(
      'noti_senderId',
      'name avatar'
    )
  }

  static async unFriendOrCancelNotification({ senderId, receiverId }) {
    await Notification.findOneAndDelete({
      noti_senderId: senderId,
      noti_receiverId: receiverId,
    })
    await Notification.findOneAndDelete({
      noti_senderId: receiverId,
      noti_receiverId: senderId,
    })
  }

  static async cancelRequestFriendNotification({ senderId, receiverId }) {
    await Notification.findOneAndDelete({
      noti_senderId: senderId,
      noti_receiverId: receiverId,
    })
    await Notification.findOneAndDelete({
      noti_senderId: receiverId,
      noti_receiverId: senderId,
    })
  }

  static async createMessageNoti({ sendId, receiverId, type, content, url }) {
    if (type === 'friend') {
      return await friendNotification({
        sendId,
        receiverId,
        type,
        content,
        url,
      })
    }
    const newNoti = await Notification.findOneAndUpdate(
      {
        noti_type: type,
        noti_senderId: sendId,
        noti_receiverId: receiverId,
        noti_url: url,
      },
      {
        noti_type: type,
        noti_content: content,
        noti_senderId: sendId,
        noti_receiverId: receiverId,
        noti_url: url,
      },
      { upsert: true, new: true }
    ).populate('noti_senderId', 'name avatar')

    return newNoti
  }

  static async friendNotification({ sendId, receiverId, type, content, url }) {
    if (content === 'đã chấp nhận lời mời kết bạn.') {
      await Notification.findOneAndUpdate(
        {
          noti_senderId: receiverId,
          noti_receiverId: sendId,
          noti_type: type,
        },
        { noti_content: 'và bạn đã trở thành bạn bè' },
        { new: true, upsert: true }
      ).populate('noti_senderId', 'name avatar')
    }
    if (
      content === 'đã từ chối lời mời kết bạn.' ||
      content === 'vừa gửi cho bạn lời mời kết bạn.'
    ) {
      await Notification.findOneAndDelete({
        noti_senderId: receiverId,
        noti_receiverId: sendId,
        noti_type: type,
      })
    }

    return await Notification.findOneAndUpdate(
      {
        noti_senderId: sendId,
        noti_receiverId: receiverId,
        noti_type: type,
        noti_url: url,
      },
      { noti_content: content },
      { new: true, upsert: true }
    ).populate('noti_senderId', 'name avatar')
  }
}

module.exports = NotificationService
