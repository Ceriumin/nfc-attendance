import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return reject(err);
            resolve(hash as string);
        });
    })
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}