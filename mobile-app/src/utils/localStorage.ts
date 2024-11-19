import AsyncStorage from "@react-native-async-storage/async-storage";
import { ForumInfo } from "../model/forums";
import CookieManager from "@react-native-cookies/cookies";
import { CONFIG } from "../config/config";



const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(
      key,
      value,
    );
  } catch (error) {
    console.log(error, "error");
    // Error saving data  
  }
};

const storeObject = async <T>(key: string, value: T) => {
  const stringifiedValue = JSON.stringify(value)
  try {
    await AsyncStorage.setItem(
      key,
      stringifiedValue,
    );
  } catch (error) {
    console.log(error, "error");
    // Error saving data  
  }
};

const retrieveObject = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // We have data!!
      return JSON.parse(value)
    }
    else {
      // Key not found
      return null;
    }
  } catch (error) {
    console.log(error, "value err");
    // Error retrieving data
  }
};

const getForumInfo = async (): Promise<ForumInfo> => {
  const data = await retrieveObject('forum_info')
  return data
}


const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(
      key,
    );
  } catch (error) {
    console.log(error, "error");
    // Error saving data  
  }
};

const clearStorage = async () => {
  await AsyncStorage.clear()
}

const retrieveData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // We have data!!
      return value
    }
    else {
      // Key not found
      return null;
    }
  } catch (error) {
    console.log(error, "value err");
    // Error retrieving data
  }
};


interface SessionToken {
  token: string | undefined;
  expires: string | undefined;
}

const getSessionToken = async (): Promise<SessionToken> => {
  const cookie = await CookieManager.get(CONFIG.api.url)
  const token = cookie['__Secure-next-auth.session-token']
  return { token: token?.value, expires: token?.expires }
}

const clearCookie = async () => {
  await CookieManager.clearAll()
}


export { storeData, retrieveData, removeData, clearStorage, getForumInfo, storeObject, retrieveObject, getSessionToken, clearCookie }