<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <main class="flex-1 relative overflow-y-auto focus:outline-none">
    <div class="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-medium leading-6 text-gray-900 sm:truncate">Tasks</h1>
      </div>
    </div>

    <div class="mx-8 m-8 sm:block">
      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="task in tasks" :key="task.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ task.name }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ task.description }}</div>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ task.status }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>

import DataService from '@/services/data.service'
export default {
  data() {
      return {
          tasks: []
      }
  },
  created () {
      DataService.getTasks().then((res)=>{
          this.tasks=res.data
      })
  },
}
</script>
