<script lang="ts">
    import { goto } from "$app/navigation";
    export let data; // dari +layout.server.ts
    const role = data.user.role.name;
    console.log("✅ Role:", data.user.role.name);

    // langsung arahkan
    if (role === "super_admin") goto("/dashboard/super");
    else if (role === "admin") goto("/dashboard/admin");
    else goto("/dashboard/member");
</script>
