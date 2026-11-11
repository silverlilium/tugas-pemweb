import { Router } from 'express';
import { checkId, createBukuController } from '../controllers/buku.controller.js';

export function createBukuRouter(model) {
  const router = Router();
  const controller = createBukuController(model);
  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.get('/:id', checkId, controller.getOne);
  router.put('/:id', checkId, controller.update);
  router.delete('/:id', checkId, controller.delete);
  return router;
}
