<script lang="ts">
    import type { User } from "$lib/types";
    export let data;
    let users: User[] = data.users;
</script>

<h2 class="text-xl font-semibold mb-4">Daftar User</h2>
<table class="w-full text-left border">
    <thead>
        <tr class="bg-gray-100">
            <th class="p-2">ID</th><th>Email</th><th>Role</th><th>Aksi</th>
        </tr>
    </thead>
    <tbody>
        {#each users as u}
            <tr class="border-t">
                <td class="p-2">{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role.name}</td>
                <td>
                    <a href="/dashboard/users/{u.id}" class="text-indigo-600"
                        >Edit</a
                    >
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<a href="/dashboard/users/add" class="btn mt-4">+ Tambah User</a>
