var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { NextResponse } from 'next/server';
import Character from '@/models/Character';
import { findAll, createOne, updateOne } from '@/lib/db-utils';
function isAdmin(request) {
    const auth = request.headers.get('authorization');
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!auth || !adminUser || !adminPass)
        return false;
    const [type, credentials] = auth.split(' ');
    if (type !== 'Basic')
        return false;
    const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
    return user === adminUser && pass === adminPass;
}
export async function GET() {
    try {
        const characters = await findAll(Character, { isActive: true }, { createdAt: -1 });
        return NextResponse.json(characters);
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
    }
}
export async function POST(request) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const character = await createOne(Character, Object.assign(Object.assign({}, body), { isActive: true }));
        return NextResponse.json(character, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
    }
}
export async function PUT(request) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const _a = await request.json(), { _id } = _a, update = __rest(_a, ["_id"]);
        const updated = await updateOne(Character, { _id }, update);
        return NextResponse.json(updated);
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
    }
}
export async function DELETE(request) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { _id } = await request.json();
        const deleted = await updateOne(Character, { _id }, { isActive: false });
        return NextResponse.json(deleted);
    }
    catch (error) {
        return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
    }
}
