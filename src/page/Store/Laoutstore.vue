<template>
    <div class="drawer drawer-open ">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content mx-4">
            <slot></slot>
        </div>
        <div class="drawer-side">
            <label for="my-drawer-2" aria-label="close sidebar" ></label>
            <ul class="menu p-4 w-80 min-h-full bg-blue-300 text-base-content">
                <li><a class="text-2xl font-bold">Store Admin</a></li>
                <li class="my-1" >
                    <div class="bg-blue-200 collapse my-1 border"> DashBoard </div>
                    <div class="bg-blue-200 collapse my-1 border"> Menu </div>
                </li>
                <li class="bg-blue-200 collapse my-1 border"><a>Logout</a></li>
            </ul>
        </div>
    </div>
</template>