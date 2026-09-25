<script setup lang="ts">
import { matchesDateFilter, type DateFilter } from "~~/app/utils";
import { feedsInfo } from "~~/utils/api";

definePageMeta({
  middleware: "feed",
});

const route = useRoute();
const router = useRouter();
const page = computed(() => +route.params.page || 1);
const feed = computed(() => route.params.feed as keyof typeof feedsInfo);
const isValidFeed = computed(() => !!feedsInfo[feed.value]);
const dateFilter = ref<DateFilter>("all");
const dateFilters: Array<{ label: string; value: DateFilter }> = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

// const transition = ref('slide-right')
const pageNo = computed(() => Number(page.value) || 1);
const displayedPage = ref(pageNo.value);

useHead({
  title: feedsInfo[feed.value]?.title,
});

const state = useStore();

if (isValidFeed.value) {
  await fetchFeed({ page: pageNo.value, feed: feed.value });
}
const items = computed(
  () => getFeed(state.value, { page: pageNo.value, feed: feed.value }) || [],
);
const filteredItems = computed(() => {
  return items.value.filter((item) =>
    matchesDateFilter(item.time, dateFilter.value),
  );
});
const loading = computed(() => items.value.length === 0);

const maxPage = computed(() => {
  return +feedsInfo[feed.value]?.pages || 0;
});

function pageChanged(to: number) {
  if (!isValidFeed.value) {
    return;
  }

  if (to <= 0 || to > maxPage.value) {
    router.replace(`/${feed.value}/1`);
    return;
  }

  if (to === maxPage.value) {
    return;
  }

  // Prefetch next page
  fetchFeed({
    feed: feed.value,
    page: page.value + 1,
  }).catch(() => {});

  // transition.value = from === -1
  //   ? null
  //   : to > from
  //     ? 'slide-left'
  //     : 'slide-right'

  displayedPage.value = to;
}

onMounted(() => pageChanged(page.value));
watch(page, (to) => pageChanged(to));
</script>

<template>
  <div class="view">
    <ItemListNav :feed="feed" :page="page" :max-page="maxPage" />

    <div :key="displayedPage" class="news-list">
      <div class="date-filters">
        <button
          v-for="option in dateFilters"
          :key="option.value"
          type="button"
          :class="{ active: dateFilter === option.value }"
          @click="dateFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <LoadSpinner v-if="loading" />
      <template v-else>
        <div v-if="filteredItems.length === 0" class="empty-state">
          No posts in this time range.
        </div>
        <ul v-else>
          <PostItem v-for="item in filteredItems" :key="item.id" :item="item" />
        </ul>
        <ItemListNav :feed="feed" :page="page" :max-page="maxPage" />
      </template>
    </div>
  </div>
</template>

<style lang="postcss">
.news-list {
  background-color: #fff;
  border-radius: 2px;
  position: absolute;
  top: 40px;
  left: 0;
  margin: 10px 0;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);

  & ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
}

.date-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px 0;

  & button {
    border: 1px solid #d5d5d5;
    background: #fff;
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    color: #333;

    &.active {
      background: #ff6600;
      border-color: #ff6600;
      color: #fff;
    }
  }
}

.empty-state {
  padding: 24px 16px;
  text-align: center;
  color: #666;
}

.slide-left-enter,
.slide-right-leave-to {
  opacity: 0;
  transform: translate(30px, 0);
}

.slide-left-leave-to,
.slide-right-enter {
  opacity: 0;
  transform: translate(-30px, 0);
}

.item-move,
.item-enter-active,
.item-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.item-enter {
  opacity: 0;
  transform: translate(30px, 0);
}

.item-leave-active {
  position: absolute;
  opacity: 0;
  transform: translate(30px, 0);
}

@media (max-width: 600px) {
  .news-list {
    margin: 10px 0;
  }
}
</style>
