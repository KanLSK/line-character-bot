import connectToDatabase from '../config/database';
export { connectToDatabase };
export async function findAll(model, filter = {}, sort = {}, limit = 100) {
    await connectToDatabase();
    return model.find(filter).sort(sort).limit(limit).exec();
}
export async function findOne(model, filter) {
    await connectToDatabase();
    return model.findOne(filter).exec();
}
export async function createOne(model, data) {
    await connectToDatabase();
    const doc = new model(data);
    return doc.save();
}
export async function updateOne(model, filter, update) {
    await connectToDatabase();
    return model.findOneAndUpdate(filter, update, { new: true }).exec();
}
export async function deleteOne(model, filter) {
    await connectToDatabase();
    return model.findOneAndDelete(filter).exec();
}
