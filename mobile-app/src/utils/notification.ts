import notifee from '@notifee/react-native';

interface notificaitonContent{
  title:string;
  content:string;
}
async function onDisplayNotification({title,content}:notificaitonContent) {
  // Request permissions (required for iOS)
await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: title,
    body: content,
    android: {
      
      channelId,
      smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
      largeIcon:require("../assets/appicon-removebg-preview.png")
    },
  });
}
function clearNotification(){
  notifee.cancelAllNotifications()
}
export {onDisplayNotification,clearNotification};
