import { JwtPayload } from "jsonwebtoken";
import axios from "axios";


export async function updateJWTNonce(JWT: JwtPayload) {
  
  let accessToken
  try {
    const tokenResponse = await axios.post(
      "https://othent.us.auth0.com/oauth/token", {
        grant_type: "client_credentials",
        client_id: process.env.auth0ClientId,
        client_secret: process.env.auth0ClientSecret,
        audience: "https://othent.us.auth0.com/api/v2/",
      },
    );
    accessToken = tokenResponse.data.access_token;
  } catch(e) {
    console.log('Error retrieving access token.')
    return true
  }

  let userResponse
  try {
    userResponse = await axios.request({
      method: "PATCH",
      url: `https://othent.us.auth0.com/api/v2/users/${JWT.sub}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      data: { user_metadata: { lastNonce: JWT.iat } },
    })
    if (userResponse.data.user_metadata.lastNonce === JWT.iat) {
      return true
    } else {
      console.log('Error updating lastNonce value.')
      return false
    }
  } catch (e) {
    console.log('Error updating lastNonce value.')
    return false
  }


}


