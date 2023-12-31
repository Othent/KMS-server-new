// // import { generateMnemonic, getKeyFromMnemonic  } from 'arweave-mnemonic-keys'

// interface JWKInterface {
//   kty: string;
//   e: string;
//   n: string;
//   d?: string | undefined;
//   p?: string | undefined;
//   q?: string | undefined;
//   dp?: string | undefined;
//   dq?: string | undefined;
//   qi?: string | undefined;
// }

// export async function generateKey(): Promise<{
//   mnemonic: string;
//   JWK: JWKInterface;
// }> {
//   // const mnemonic = await generateMnemonic() // while testing
//   // const JWK = await getKeyFromMnemonic(mnemonic) // while testing

//   const mnemonic =
//     "crash buffalo kit mule arena try soup custom round enter enforce nasty";

//   const JWK = {
//     kty: "RSA",
//     n: "hzVT40eFDUz5c6olsFU-LU1eDbgGQ0huJMExmXNVGcqyikVrLgV9Pir29ajXq92G7dX1-ZHDfmPuQlWE0C1inZh_0wawdmHmM0RFCazFBz14iF3pRSIOM0hNjzaJ1pJQz62qnvK11wMrUTDI__JgRnIQEMb05DdpOprgKi9BKKoG6d2wJXxMjUWO5nCtBuifq3jGxuyxV8hFmikAepsqcziTQcFNdeZXlNF4CivQKml0ALhOUPkAAFOAhD4hqUyuT1yvm10ZQm4O7rkNump_GcNgqJIDLgKC0UAqfwcSGDCHNlCMrpG7Nuq7x8zjTMzn7Ox8a5DrQMGpUqvXuMHnzo9bSM_Tl27GutetNigsWoioBU_vQSWnPOkCPGkAImKqupzFDe1tgVMwcgqZ4g0raWsHZxdIKCMZOjAxnhH2EYEu5hLZk8wENdDkKWEoOgdK-m288nHcWamy9_NbWPyv7RZ3L89egIJ3CTIM5HpfljiaESQmISG59AtBttUjJH5W3LkQcoJTctxulZBSUmZEmJdBZqlZm3TOkxrjI9uFtsLKSqKGcsEido0pjO9kd-MfwSotFjaL-Uo641W9l7k1mI9s7pHQZ79aSzTxFDT7OMzR-oeUIua4q8UlWWwEvrStQahM7WirzPi8kVT2wdg0Pgc6vemU50z1w_Y-gAJRHOM",
//     e: "AQAB",
//     d: "WOgSD0M6FDLnXM0nFzoWNofHLtIxHBEGjBiVWsfhz6HfoNhgz9RANJ7f4U1y88opLT8iDUdx-ywOwYOmX5VYYTSj6MlfQ5jAXDmqA-CddlNPbKwD9bedCs-iYGeGX5e6l7UkmnwSYh3tX-fqY5KnB-t88OtCoMZm5Whtuo90Ex8qiKGDcEK5u7Nfcdvpir9wLrquSqPdQVGpouMPM4_QbA9plTVckAg00uCiRF3m9dx9sPOAW_I_s_c0bMDGNaL8g6b4ufqP34SrQQJiKpBYn0I_ztikSp7QEnRU_U5S8aEHaAmzWB7vsf7MF2d8l0Wtw7cFYV3bs6skgf4JTa4DlHMuH3WQ_JKO82zg3As_68T9MT8rBWFBZF97iDuSeOUMjxll-x461bNDgd2WVS0YrxcDPp1ah-3PYQ7M4j0sjJDfVjBvimECAD97ScxdI_LM0L88lKc79a6gQCWFoLbiNpfFIChynU-4z-cuJ3XMJKXH3Sq_OWqlvmNaYUubgie8ZtvA4rSiwgsAzW8CAEYkaaOZOMTqF32U7AIzblbkh80WfPofkqrEQId9e_gP2sa3P59abbRZaINDq6WLus8XEILk526yjb-joAzLRTAD8xMYHcuw0Z-YN-uVu08dPeRs7VwAJ3I7chpLOIaFUwtdNBvl7_eF8lwvM62lcyPRfyE",
//     p: "06LM6_RJBI4zfNTprJ6StCn1Oj-N-s7xTw5YUasafOw6eb6CwepQp7IFJFa5pQcN1AiKueHeoIumQBimrPnJvEC3fgyQaKZaRDtyOEpOnLdGjigHBPesw4Zv9QoCaL9xqO782Sj9ar3sZciPccqDzEbe5iBDUD751JHhZc_nbFob5v1BZlr3oaiBQtJvvNcp79h4ncUDNtPLCd5zTueBYcSMRopGkl0Q1bjAGgGfUm85ek8o9Xcxkf4rs4-cenOdu8I1qLC2bSkfZlGX_ieO04CovEtnbaVO4tGMbTcNV4dchf432aoNfBUzrTFObTHsaeBarSIZMk3-Qd56A4nJ-w",
//     q: "o40gWU0uVsM3PgUYt2kZDhkDc_v5AJRfsudDXsfDT62tGERPVgLXDQebz6C6ZGBnPCnNC_LO3D8xmQWhO6uoS0Hy2ExlgpZwex0SBxJcSUUcy1EUanpPqldz5GIBfrbi2iNRYTFhAQqhWrU7yWO9SMkuTlhX641jBXWTytoEoMsun7mMA3-7DkY8swOjW-ZbwE6uuwWp71Mtub5pCR0nJddoRBPDeTAwH3Vv2wHC5A71Tzbx4hkKUhJC1gUn-_CRTMwVDNmdqCek95Syhsd6vZ7TbcnxO2b79cRI6L_DJtXIYGBwX4x-DEN0H7X_ChsqRSXyGLX-LIPeY2Y7hgQsOQ",
//     dp: "nIgoW0kGjLkEugrcftGWnmz-NUP2ppBTiO6KQnV0lPtAUPWozvaZCz-vb-45RydNgguDV_MI7-P6ZiQVe5ERNg0D6tYuJUkNMLRrSdkkBePE6rYOYw0xmjigLDRoDcOztIh3OcOIlF-_LpVGC5sHGps8mCc6wmqh7Cit9tjsSYboZlPhAGy-BbKVULBG9vyJxx1sMP0b4HyMC1OeI7k1R_PQ8QerJOxy3DDW3SVgCt-7Ooy8NbogTuQYvKm2yhcjjlEZ0RhLBbhJwisNaW0mxaa-pu56pG2FSFxHKixy0M-Mjoq2EmclrCYeX7Y9VKR9QN4xEydKTZvEOEHuKxnJ6w",
//     dq: "hTZ51sLqr3iqEjYMf7d21OjCy0G8-x_fItUDJrwG9Ws8xbs984y0pMRBwMflicSL0ZEqlkTbAMHoH_9Z6ERU-5dnuY3gUJFAZMa03FW0HWnRnjkYK_Ib2V8J4keBeDh2Zb7GliemHzcNXdioLcyzbAmRUfbbBd1Pfi7ahis2AdH809RJmr_7GBFVd2nLMRtcODLeVy6xz2EsqVHSM74vGL9vCaQfXyJE0BrTVMsGdsNIQ5E5SzOiGF8PWUsx2h-D-c1wh9rocwJ3d8EB-I2aB8DJ7W7CseOb7f5GdG1dAtC2OOnUHb9NG6gFeZ6_cPfXYiMaIc56jL-L7-JhMTNM4Q",
//     qi: "ru_2PHQZyTUeWP_7hlNHDsQgz81jJNiNP6PzpT4x9S6wfjXA79cttsEl-ruSfWeEOSEm_7ULYbNtN9lNqOngC949HfB1ylrt-8lRHVw-V769NgFLMaQYOzVbxx3oY1sv1-5HLzXI8FikePaGdTPVx2uIQJmuiV5s5jr8CnUE83Etz_qtbCfxdmBQuP48BAVm8D9MVuoV7llQtKHXD2TJrfwO1OEBX1-tOqB1CBQadVT4HfG3iVoMvFLvFhcfI2UdHTCafEIGlzFndggXpwHEs0-lDWcnbgo_VfHfwLTXbE8TXmRt8a6I6DeSh4KbOzW2GgFRVqaLDFrznfUhD_Nytg",
//     kid: "2011-04-29",
//   };

//   return { mnemonic, JWK };
// }
