import express from "express";

export function pingHandlerFactory() {
  return (req: express.Request, res: express.Response) => {
    res.json({ response: true });
  };
}
