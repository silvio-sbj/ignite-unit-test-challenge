import { container } from "tsyringe";

import { Request, Response } from "express";

import { DoTransferenceUseCase } from "./DoTransferenceUseCase";

class DoTransferenceController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { id: sender_id } = request.user;
    const { user_id: receiver_id } = request.params;

    const doTransferenceUseCase = container.resolve(DoTransferenceUseCase);
    await doTransferenceUseCase.execute({
      sender_id,
      receiver_id,
      amount,
      description,
    });

    return response.status(201).send();
  }
}

export { DoTransferenceController };
