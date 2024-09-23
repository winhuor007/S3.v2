import { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

const validateRequest =
  (schema: AnySchema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err: any) {
      console.error(`validateRequest() method error: `, err)
      next(err)
      // res.status(400).json({
      //   message: "Validation failed",
      //   errors: err.errors,
      // });
    }
  };

export default validateRequest;
