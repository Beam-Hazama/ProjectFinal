<template>
    <div class="drawer drawer-open ">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content mx-4">
            <slot></slot>
        </div>
        <div class="drawer-side">
            <label for="my-drawer-2" aria-label="close sidebar" ></label>
            <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <li><a class="text-2xl font-bold">Admin Menu</a></li>
                <li class="my-1" >
                    <div> DashBoard </div>
                    <div> Menu </div>
                </li>
                <li><a>Logout</a></li>
            </ul>
        </div>
    </div>
</template>