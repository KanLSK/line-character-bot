import connectToDatabase from '../config/database';
import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export { connectToDatabase };

export async function findAll<T extends Document>(model: Model<T>, filter: FilterQuery<T> = {}, sort = {}, limit = 100) {
  await connectToDatabase();
  return model.find(filter).sort(sort).limit(limit).exec();
}

export async function findOne<T extends Document>(model: Model<T>, filter: FilterQuery<T>) {
  await connectToDatabase();
  return model.findOne(filter).exec();
}

export async function createOne<T extends Document>(model: Model<T>, data: Partial<T>) {
  await connectToDatabase();
  const doc = new model(data);
  return doc.save();
}

export async function updateOne<T extends Document>(model: Model<T>, filter: FilterQuery<T>, update: UpdateQuery<T>) {
  await connectToDatabase();
  return model.findOneAndUpdate(filter, update, { new: true }).exec();
}

export async function deleteOne<T extends Document>(model: Model<T>, filter: FilterQuery<T>) {
  await connectToDatabase();
  return model.findOneAndDelete(filter).exec();
} 