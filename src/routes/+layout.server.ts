export const load = async ({ locals, url }: { locals: any; url: any }) => {
    // Pass user information if available
    const user = locals.user || null;

    return {
        user,
        pathname: url.pathname
    };
};