import express, { CookieOptions } from "express";
import { OutgoingHttpHeaders } from "http";

export async function extractHandlerResponse(handler: express.Handler, req: express.Request) {
  const resBuilder = ResBuilder.getBuilder();
  const next = resBuilder.getNextFn();

  try {
    await handler(req, resBuilder, next);

    return resBuilder.getResponse();
  } catch (err) {
    return null;
  }
}

export interface ResBuilderResponse {
  status: null | number;
  headers: Record<string, undefined | (number | string)[]>;
  cookies: Record<string, { value: string, options?: CookieOptions }>;
  data: any;
  nextCalled: boolean;
}

class ResBuilder /* implements express.Response */ {

  private response: ResBuilderResponse = {
    status: null,
    headers: {},
    cookies: {},
    data: undefined,
    nextCalled: false,
  }

  // STATUS:

  status(status: number) {
    this.response.status = status;

    return this;
  }

  sendStatus(status: number) {
    this.status(status);
    this.send();

    return this;
  }

  // HEADERS:

  header(field: string, value?: number | number[] | string | string[]) {
    return this.set(field, value);
  }

  set(field: string, value?: number | number[] | string | string[]) {
    const newValue = Array.isArray(value) ? value : (value ? [value] : []);

    this.response.headers[field] = newValue;

    return this;
  }

  get(field: string): undefined | (number | string)[] {
    return this.response.headers[field];
  }

  append(field: string, value?: number | number[] | string[] | string): this {
    if (!this.response.headers[field]) {
      return this.set(field, value);
    }

    const newValue = Array.isArray(value) ? value : (value ? [value] : []);
    const prevValue = this.response.headers[field];

    if (Array.isArray(prevValue)) {
      prevValue.push(...newValue);
    } else {
      this.response.headers[field] = [...prevValue, ...newValue];
    }

    return this;
  }

  setHeader(name: string, value: number | number[] | string | string[]) {
    return this.set(name, value);
  }

  getHeader(name: string): undefined | (number | string)[] {
    return this.get(name);
  }

  appendHeader(name: string, value?: number | number[] | string[] | string) {
    return this.append(name, value);
  }

  getHeaders(): OutgoingHttpHeaders {
    return this.response.headers as unknown as OutgoingHttpHeaders;
  }

  getHeaderNames(): string[] {
    return Object.keys(this.response.headers);
  }

  hasHeader(name: string): boolean {
    return this.response.headers.hasOwnProperty(name);
  }

  removeHeader(name: string): void {
    delete this.response.headers[name];
  }

  // COOKIES:

  cookie(name: string, value: string, options?: CookieOptions) {
    this.response.cookies[name] = { value, options };

    return this;
  }

  clearCookie(name: string) {
    delete this.response.cookies[name];

    return this;
  }

  // DATA:

  send(data?: any) {
    this.response.data = data;

    return this;
  }

  json(obj: any) {
    this.send(obj);

    return this;
  }

  // GETTERS:

  static getBuilder() {
    const builder = new ResBuilder();

    return builder as unknown as express.Response & {
      getNextFn: ResBuilder["getNextFn"];
      getResponse: ResBuilder["getResponse"];
    }
  }

  getNextFn() {
    return () => {
      this.response.nextCalled = true;
    }
  }

  getResponse() {
    return this.response;
  }
}
