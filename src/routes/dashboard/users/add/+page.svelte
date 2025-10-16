<form method="POST" class="max-w-lg space-y-3">
    <h2 class="text-xl font-semibold">Tambah User</h2>
    <input
        name="email"
        type="email"
        placeholder="Email"
        required
        class="w-full border px-3 py-2"
    />
    <input
        name="password"
        type="password"
        placeholder="Password"
        required
        class="w-full border px-3 py-2"
    />
    <select name="role_id" required class="w-full border px-3 py-2">
        <option value="1">Super Admin</option>
        <option value="2">Admin</option>
        <option value="3">Member</option>
    </select>
    <button class="bg-green-600 text-white px-4 py-2 rounded">Simpan</button>
</form>
