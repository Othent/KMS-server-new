import axios from "axios";
import { JwtPayload } from "jsonwebtoken";
import * as dotenv from 'dotenv'
dotenv.config()

export async function getLastNonce(JWT: JwtPayload) {

    if (!process.env.auth0ClientId || !process.env.auth0ClientSecret) {
        throw new Error('Please specify a auth0ClientId and auth0ClientSecret in the env')
    }
    
    let accessToken
    try {
        const tokenResponse = await axios.post("https://othent.us.auth0.com/oauth/token", {
            grant_type: "client_credentials",
            client_id: process.env.auth0ClientId,
            client_secret: process.env.auth0ClientSecret,
            audience: "https://othent.us.auth0.com/api/v2/",
        });
        accessToken = tokenResponse.data.access_token;
    } catch(e) {
        console.log('Failed to retrieve access token')
        return false
    }

    let lastNonce
    try {    
        const userResponse = await axios.request({
            method: "GET",
            url: `https://othent.us.auth0.com/api/v2/users/${JWT.sub}`,
            headers: {
                authorization: `Bearer ${accessToken}`,
                "content-type": "application/json"
            }
        });
        lastNonce = userResponse.data.user_metadata.lastNonce
        return lastNonce
    } catch(e) {
        console.log('Failed to update last nonce')
        return false
    }

}