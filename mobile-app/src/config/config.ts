import { ZOOM_GROUP_ID, ZOOM_DOMAIN, API_URL, API_CALLBACK, ZOOM_SESSION_PASSWORD } from '@env'

export const CONFIG = {

    zoom: {
        groupId: ZOOM_GROUP_ID,
        domain: ZOOM_DOMAIN,
        sessionPassword: ZOOM_SESSION_PASSWORD
    },
    api: {
        url: API_URL,
        callback: API_CALLBACK
    },
    enabled: { // flags to temporarily disable a feature
        storeFcm: false
    }
}