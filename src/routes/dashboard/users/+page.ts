import axios from '$lib/api';
import type { User } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    const { data } = await axios.get<User[]>('/users');
    return { users: data };
};