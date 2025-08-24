---
title: 卡园客户端
published: 2025-04-10
updated: 2025-04-10
description: ''
tags: []
category: 代码
---

随便写了一个渲染卡园json的parser，图像加载的缓存还没写
> http://106.55.6.119/c/lgu


用proxifier抓微信小程序的包，改first,comment

```txt
query Posts(
  $schoolId: ID
  $topicId: ID
  $subtopicId: ID
  $keyword: String
  $orderBy: PostOrder
  $after: String
  $excludeTopicId: ID
  $rankFilter: RankFilter
) {
  posts(
    filter: {
      schoolId: $schoolId
      topicId: $topicId
      subtopicId: $subtopicId
      keyword: $keyword
      excludeTopicId: $excludeTopicId
      rankFilter: $rankFilter
    }
    orderBy: $orderBy
    first: 10
    after: $after
  ) {
    edges {
      node {
        ...PostFields
        __typename
      }
      __typename
    }
    totalCount
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
      __typename
    }
    __typename
  }
}

fragment ProfileFields on Profile {
  id
  nickname
  avatarUrl
  bio
  gender
  grade
  institute
  __typename
}

fragment UserFields on User {
  id
  username
  createdAt
  profile {
    ...ProfileFields
    __typename
  }
  verifyCountdownAt
  verify {
    id
    school {
      id
      name
      logoUrl
      enShort
      oaAppid
      __typename
    }
    campus {
      id
      name
      __typename
    }
    __typename
  }
  __typename
}

fragment ActivitiesFields on Activities {
  activitiesTypeSchema
  activitiesTypeData
  nameData {
    suffix
    typeSchemaIndex
    __typename
  }
  toggleText
  infoEnabled
  __typename
}

fragment SubtopicFields on Subtopic {
  id
  name
  description
  weight
  iconUrl
  isDeleted
  isWishEnabled
  isForceContact
  activities {
    ...ActivitiesFields
    __typename
  }
  __typename
}

fragment TopicFields on Topic {
  id
  name
  description
  weight
  iconUrl
  isDeleted
  isWishEnabled
  isForceContact
  subtopics {
    edges {
      node {
        ...SubtopicFields
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment PinField on Pin {
  indexPicturesEnabled
  indexCommentEnabled
  indexLineLength
  createdAt
  creatorId
  __typename
}

fragment PostFields on Post {
  id
  content
  images
  isAnonymous
  creator {
    ...UserFields
    __typename
  }
  contact {
    contact
    expiredAt
    __typename
  }
  topic {
    ...TopicFields
    __typename
  }
  subtopic {
    ...SubtopicFields
    __typename
  }
  createdAt
  updatedAt
  isLocked
  pin {
    ...PinField
    __typename
  }
  viewerCanUpdate
  viewerCanDelete
  likeCount
  commentCount
  viewerHasLiked
  viewerHasMarked
  school {
    id
    name
    enShort
    logoUrl
    __typename
  }
  comments(first: 3, order: RANK) {
    totalCount
    edges {
      node {
        id
        content
        isAnonymous
        createdAt
        creator {
          ...UserFields
          __typename
        }
        viewerCanDelete
        likeCount
        viewerHasLiked
        __typename
      }
      __typename
    }
    __typename
  }
  activitiesInfo
  __typename
}

```

<!-- more -->