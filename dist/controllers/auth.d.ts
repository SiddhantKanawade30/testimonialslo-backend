import express from "express";
import type { Request, Response, NextFunction } from "express";
export declare const signup: (req: Request, res: Response, next: NextFunction) => Promise<express.Response<any, Record<string, any>> | undefined>;
export declare const signin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map