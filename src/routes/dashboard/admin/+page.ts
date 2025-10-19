export const load = async ({ parent }: { parent: any }) => {
    const { user } = await parent();
    return { user };
};