export const roundOpenings = ["nickname", "profile", "story"];

export const situations = {
  nickname: {
    intro: ["어제 파란 팀이셨죠? 민수예요 ㅎㅎ", "회사 밖에서까지 민수 님은 딱딱하니까 편하게 불러요. 오빠도 괜찮고."],
    options: [
      {
        id: "names",
        text: "단톡이랑 같이 민수 님으로 저장할게요. 저는 이름으로 불러요.",
        delta: -2,
        why: "호칭을 정하고 다른 얘기는 열어뒀어요.",
        reaction: ["네 그럼 이름으로 ㅎㅎ"],
        remember: {nickname: "formal"}
      },
      {
        id: "afterNine",
        text: "민수 님 맞죠? 개인 톡은 저녁 아홉 시 지나야 봐요.",
        delta: -1,
        why: "답장을 볼 시간을 미리 알려뒀어요.",
        reaction: ["아홉 시 이후. 네 그때까지 기다릴게요."],
        remember: {replyAt: "after9"},
        evidence: "replyTime"
      },
      {
        id: "rules",
        text: "모임에서 부르던 대로 해요. 공지는 단톡에서 보면 되죠?",
        delta: 0,
        why: "호칭과 공지 전달 경로를 구분했어요.",
        reaction: ["네 공지는 단톡이에요. 개인 톡으로 또 보내진 않을게요."],
        remember: {notice: "group"}
      }
    ],
    next: "taste"
  },
  taste: {
    intro: ["어제 틀었던 노래, 제 선곡이에요.", "다른 분들은 그냥 트는데 저는 분위기를 좀 보거든요 ㅎㅎ"],
    options: [
      {
        id: "source",
        text: "곡이 좋던데, 직접 고른 거예요? 어디서 찾았어요?",
        delta: 0,
        why: "선곡의 출처를 확인했어요.",
        reaction: ["모임 앱에서 틀면 비슷한 곡이 자동으로 나오긴 해요.", "제가 첫 곡 재생은 눌렀죠."],
        remember: {music: "auto"},
        evidence: "music"
      },
      {
        id: "groupList",
        text: "곡 목록은 단톡에 올려줘요. 다음에 다 같이 들어보죠.",
        delta: -3,
        why: "취향 얘기를 단체로 공유하게 했어요.",
        reaction: ["네 목록 뽑아볼게요. 저장을 안 해놔서 좀 찾아야 돼요."],
        remember: {music: "group"}
      },
      {
        id: "swap",
        text: "다음 선곡은 제가 하나 골라갈게요. 민수 님 것도 가져와요.",
        delta: 5,
        why: "서로 취향을 보여줄 다음 대화를 열었어요.",
        reaction: ["좋죠. 각자 한 곡씩이면 취향은 금방 알죠."],
        remember: {music: "shared"}
      }
    ],
    next: "compliment"
  },
  compliment: {
    intro: ["어제 제가 얘기할 때 잘 웃어주시더라고요.", "이렇게 말이 잘 통하는 분 있으면 모임 나갈 맛이 나요."],
    options: [
      {
        id: "creditGroup",
        text: "어제는 다들 잘 맞았죠. 다음 모임에서도 그렇게 해요.",
        delta: -2,
        why: "친밀감을 모임 전체의 분위기로 돌렸어요.",
        reaction: ["그쵸. 다들 웃어주긴 했어요."],
        next: "meal"
      },
      {
        id: "preparation",
        text: "그런 건 다들 챙기는 편이에요? 준비를 꽤 해오셨네요.",
        delta: 0,
        why: "가볍다는 호의에 들인 노력을 물어봤어요.",
        reaction: ["별거 안 해요. 커피 쿠폰도 문구 네 번 고르다가 그냥 '고마워요'로 보내고.", "이 얘기를 왜 했지 ㅎㅎ"],
        remember: {giftEffort: "drafts"},
        evidence: "giftEffort",
        next: "gift"
      },
      {
        id: "writtenRules",
        text: "설명은 글로도 받아둘게요. 다음엔 그걸 먼저 볼게요.",
        delta: -4,
        why: "개별 설명 없이도 모임에 참여할 준비를 했어요.",
        reaction: ["네 룰북 링크 드릴게요. 그게 저보다 정확해요."],
        remember: {activityOnly: true},
        next: "gift"
      }
    ],
    variants: [
      {
        when: {music: "auto"},
        intro: ["제 선곡 듣고 웃는 거 보니까 취향도 비슷한가 봐요 ㅎㅎ", "그 앱은 다들 그냥 넘기는데 저는 듣는 순서까지 보거든요."],
        options: [
          {
            id: "quoteSource",
            text: "아까 자동추천이라면서요. 그럼 선곡한 이름은 누구로 해요?",
            delta: -2,
            why: "앞서 확인한 출처를 자랑에 연결했어요.",
            reaction: ["제가... 재생 담당이라고 하면 되겠네요."],
            remember: {proofUsed: "music"},
            uses: "music",
            next: "claimCheck"
          },
          {
            id: "creditGroup",
            text: "어제는 다들 잘 맞았죠. 다음 모임에서도 그렇게 해요.",
            delta: -2,
            why: "친밀감을 모임 전체의 분위기로 돌렸어요.",
            reaction: ["그쵸. 다들 웃어주긴 했어요."],
            next: "meal"
          },
          {
            id: "keepSource",
            text: "추천 경로까지 같이 적어둘게요. 다음엔 저도 틀어볼게요.",
            delta: -3,
            why: "민수만 알던 방법을 다른 사람도 쓰게 했어요.",
            reaction: ["네 첫 곡만 누르면 돼요. 나머지는 제가 한 건 아니고요."],
            remember: {activityOnly: true},
            next: "gift"
          }
        ]
      }
    ],
    next: "meal"
  },
  meal: {
    intro: [
      {
        when: {gift: "declined"},
        lines: ["쿠폰은 안 보낼게요. 그건 알겠어요.", "다른 얘긴데, 모임 근처 파스타집 어때요? 사장님이 저를 알아요. 예약은 제가 할게요."]
      },
      {
        lines: ["모임 근처 파스타집 어때요? 사장님이 저를 알아요.", "제가 예약하면 편해요. 일단 두 명으로 보면 되죠?"]
      }
    ],
    options: [
      {
        id: "link",
        text: "예약은 어디서 해요? 링크부터 보고 인원은 그다음에 정해요.",
        delta: 0,
        why: "약속을 확정하지 않고 예약 방식을 확인했어요.",
        reaction: ["네이버 공개 예약이에요. 누구나 되긴 하는데 제가 먼저 본 거죠."],
        remember: {booking: "public", plan: "meal"},
        evidence: "booking",
        next: "groupPlan"
      },
      {
        id: "groupMeal",
        text: "모임 끝나고 갈 사람부터 물어봐요. 인원 모이면 가죠.",
        delta: -3,
        why: "개인 제안을 단체 일정 협의로 바꿨어요.",
        reaction: ["그럼 다 같이... 사람 더 오는지부터 봐야겠네요."],
        remember: {plan: "meal"},
        next: "groupPlan"
      },
      {
        id: "decline",
        text: "둘이 따로 갈 생각은 없어요. 모임에서만 봬요.",
        delta: -12,
        why: "둘만의 만남을 거절했어요.",
        reaction: ["네 둘이 가는 건 안 하는 걸로.", "사실 저도 그 집은 혼자 한 번 가본 거예요."],
        remember: {meal: "declined"}
      }
    ],
    variants: [
      {
        when: {booking: "public"},
        options: [
          {
            id: "quoteBooking",
            text: "아까 공개 예약이라면서요. 단골 예약은 따로 있는 거예요?",
            delta: -2,
            why: "공개 예약이라는 정보를 단골 자랑과 대조했어요.",
            reaction: ["따로 있는 건 아닌데... 예약 화면 보면서 얘기할까요."],
            remember: {proofUsed: "booking"},
            uses: "booking",
            next: "claimCheck"
          },
          {
            id: "groupMeal",
            text: "모임 끝나고 갈 사람부터 물어봐요. 인원 모이면 가죠.",
            delta: -3,
            why: "개인 제안을 단체 일정 협의로 바꿨어요.",
            reaction: ["그럼 다 같이... 사람 더 오는지부터 봐야겠네요."],
            remember: {plan: "meal"},
            next: "groupPlan"
          },
          {
            id: "decline",
            text: "둘이 따로 갈 생각은 없어요. 모임에서만 봬요.",
            delta: -12,
            why: "둘만의 만남을 거절했어요.",
            reaction: ["네 둘이 가는 건 안 하는 걸로.", "사실 저도 그 집은 혼자 한 번 가본 거예요."],
            remember: {meal: "declined"}
          }
        ]
      }
    ],
    next: {ifSeen: "gift", then: "reminder", otherwise: "gift"}
  },
  gift: {
    intro: [
      {
        when: {meal: "declined"},
        lines: ["밥 약속 얘기는 접었고, 정리 도와준 건 고마워서요.", "커피 쿠폰 하나 보낼까요?"]
      },
      {
        lines: ["어제 정리 도와줬잖아요. 커피 쿠폰 하나 보낼까요?"]
      }
    ],
    options: [
      {
        id: "plainThanks",
        text: "어제 정리는 같이 했잖아요. 감사 인사는 단톡에 남겨줘요.",
        delta: -3,
        why: "개인 선물 대신 함께한 사람들에게 인사를 돌렸어요.",
        reaction: ["네 쿠폰은 안 보내고 단톡에 고맙다고 올릴게요."],
        remember: {gift: "declined"}
      },
      {
        id: "organizer",
        text: "모임 간식으로 돌릴 거면 운영자한테 먼저 물어봐요.",
        delta: -1,
        why: "선물의 목적과 받을 사람을 바꾸는 중이에요.",
        reaction: ["모임 간식이면... 몇 개쯤 준비해야 하죠?"],
        remember: {gift: "group", plan: "snacks"},
        next: "groupPlan"
      },
      {
        id: "note",
        text: "아무 의미 없다면서요. 문구도 그냥 기본으로 보내는 거예요?",
        delta: 0,
        why: "선물에 들인 준비를 확인했어요.",
        reaction: ["기본은 아니고요. 문구 네 번 바꾸다 '고마워요'로...", "아직 결제 안 했어요. 장바구니만 좀 오래 보고 있었지 ㅎㅎ"],
        remember: {giftEffort: "drafts", gift: "pending"},
        evidence: "giftEffort",
        next: "status"
      }
    ],
    tail: ["저 이런 거 아무한테나 잘 보내요. 아 아무한테나라는 뜻은 아니고 ㅎㅎ"],
    variants: [
      {
        when: {giftEffort: "drafts"},
        options: [
          {
            id: "drafts",
            text: "문구 네 번 골랐다면서요. 이번 쿠폰은 취소해요.",
            delta: -7,
            why: "들었던 준비 과정을 짚고 선물을 거절했어요.",
            reaction: ["그 말 기억하시는구나.", "아직 결제 안 했어요. 장바구니만 좀 오래 보고 있었지 ㅎㅎ"],
            remember: {gift: "declined", giftQuoted: true},
            uses: "giftEffort",
            next: "status"
          },
          {
            id: "organizer",
            text: "모임 간식으로 돌릴 거면 운영자한테 먼저 물어봐요.",
            delta: -1,
            why: "선물의 목적과 받을 사람을 바꾸는 중이에요.",
            reaction: ["모임 간식이면... 몇 개쯤 준비해야 하죠?"],
            remember: {gift: "group", plan: "snacks"},
            next: "groupPlan"
          },
          {
            id: "plainThanks",
            text: "어제 정리는 같이 했잖아요. 감사 인사는 단톡에 남겨줘요.",
            delta: -3,
            why: "개인 선물 대신 함께한 사람들에게 인사를 돌렸어요.",
            reaction: ["네 쿠폰은 안 보내고 단톡에 고맙다고 올릴게요."],
            remember: {gift: "declined"}
          }
        ]
      }
    ],
    next: {ifSeen: "meal", then: "reminder", otherwise: "meal"}
  },
  reminder: {
    intro: ["아까 읽음은 떴던데 ㅎㅎ", "제가 길게 썼나요? 저는 톡 보내고 나면 자꾸 확인하게 되더라고요."],
    options: [
      {
        id: "asNeeded",
        text: "필요한 용건만 남겨요. 답은 제가 볼 수 있을 때 할게요.",
        delta: -5,
        why: "답장 시점과 대화의 용도를 내가 정했어요.",
        reaction: ["네. 필요한 용건이라는 게... 모임 얘기 같은 거죠?"],
        remember: {replyRule: "purpose"}
      },
      {
        id: "groupNotice",
        text: "모임 공지면 단톡에 남겨줘요. 거기서 확인할게요.",
        delta: -3,
        why: "재촉을 공지 전달 방식의 문제로 바꿨어요.",
        reaction: ["그럼 단톡에 올릴게요. 개인 톡엔 더 안 보내고요."],
        remember: {plan: "notice"},
        next: "groupPlan"
      },
      {
        id: "privateEnd",
        text: "개인 연락은 여기서 끝낼게요. 앞으로 따로 연락하지 마세요.",
        delta: -12,
        why: "사적인 연락을 종료했어요.",
        reaction: ["네. 앞으로 따로 연락하지 않을게요."],
        remember: {scope: "closed"},
        end: "quiet"
      }
    ],
    variants: [
      {
        when: {replyAt: "after9"},
        options: [
          {
            id: "agreedTime",
            text: "아까 아홉 시 이후라고 했죠. 개인 톡은 접고 공지만 남겨줘요.",
            delta: -8,
            why: "앞서 합의한 시간을 짚어 공지로 범위를 정했어요.",
            reaction: ["맞네요. 기다린다 해놓고 제가 먼저 확인했네.", "개인 톡은 안 보낼게요. 공지만 올릴게요."],
            remember: {scope: "closed"},
            uses: "replyTime",
            end: "settled"
          },
          {
            id: "asNeeded",
            text: "필요한 용건만 남겨요. 답은 제가 볼 수 있을 때 할게요.",
            delta: -5,
            why: "답장 시점과 대화의 용도를 내가 정했어요.",
            reaction: ["네. 필요한 용건이라는 게... 모임 얘기 같은 거죠?"],
            remember: {replyRule: "purpose"}
          },
          {
            id: "privateEnd",
            text: "개인 연락은 여기서 끝낼게요. 앞으로 따로 연락하지 마세요.",
            delta: -12,
            why: "사적인 연락을 종료했어요.",
            reaction: ["네. 앞으로 따로 연락하지 않을게요."],
            remember: {scope: "closed"},
            end: "quiet"
          }
        ]
      }
    ],
    next: "dating"
  },
  dating: {
    intro: [
      {
        when: {meal: "declined"},
        lines: ["둘이 보는 건 안 한다고 했죠. 그건 알겠어요.", "그럼 모임 일로만 연락하면 되죠? 어디까지인지 확인할게요."]
      },
      {
        lines: ["그럼 어떤 얘기까지 하면 되는 거예요?", "모임 일은 괜찮고 그냥 안부는 아닌 건가. 제가 구분을 잘 못했나 봐요."]
      }
    ],
    options: [
      {
        id: "definePurpose",
        text: "정산이나 일정 얘기만요. 그 외 개인 톡은 안 할게요.",
        delta: -5,
        why: "안부와 모임 용건의 경계를 확정했어요.",
        reaction: ["네 정산, 일정. 그때만 연락할게요."],
        remember: {scope: "closed"},
        end: "settled"
      },
      {
        id: "sharedGroup",
        text: "모임 얘기도 단톡에서 봐요. 둘이 잡는 약속은 없어요.",
        delta: -4,
        why: "모임 안의 관계로 정리했어요.",
        reaction: ["네 단톡에서만 볼게요."],
        remember: {scope: "group"},
        end: "group"
      },
      {
        id: "carryOn",
        text: "오늘은 여기까지 해요. 다음 공지 보고 연락 얘기도 정하죠.",
        delta: 2,
        why: "오늘 대화는 끝내되 다음 연락의 범위는 남겨뒀어요.",
        reaction: ["그럼 마지막으로 한 가지만 확인할게요."],
        next: "last"
      }
    ],
    next: "last"
  },
  last: {
    intro: [
      {
        when: {meal: "declined"},
        lines: ["둘이 만나는 건 안 하는 걸로 알고 있어요.", "연락은 모임 단톡에서만 보면 되죠?"]
      },
      {
        lines: ["오늘 아직 정한 약속은 없어요.", "다음에 개인적으로 다시 물어봐도 될까요? 아니면 단톡에서만 볼까요?"]
      }
    ],
    options: [
      {
        id: "groupOnly",
        text: "모임 일정은 단톡에서 확인할게요. 따로 만나는 건 원하지 않아요.",
        delta: -6,
        why: "남은 호감도와 상관없이 단체 관계로 정리했어요.",
        reaction: ["네. 그럼 단톡에서만 볼게요."],
        remember: {scope: "group"},
        end: "group"
      },
      {
        id: "privateEnd",
        text: "개인 연락은 여기서 끝낼게요. 앞으로 따로 연락하지 마세요.",
        delta: -12,
        why: "사적인 연락을 종료했어요.",
        reaction: ["네. 앞으로 따로 연락하지 않을게요."],
        remember: {scope: "closed"},
        end: "quiet"
      },
      {
        id: "later",
        text: "오늘은 여기까지 하고, 개인 약속은 다음에 다시 얘기해요.",
        delta: 4,
        why: "오늘 대화는 끝냈고 약속을 다시 논의할 여지는 남겼어요.",
        reaction: ["네 다음에 다시 얘기하는 걸로. 오늘은 더 안 보낼게요."],
        end: "crush"
      }
    ]
  },
  profile: {
    intro: ["어제 파란 팀 민수예요. 프사 바뀌어서 못 알아볼까 봐 ㅎㅎ", "그냥 주차하고 찍었는데 너무 공들인 사진처럼 나왔나."],
    options: [
      {
        id: "recognize",
        text: "누군지는 알아봤어요. 단톡이랑 같은 이름으로 저장할게요.",
        delta: -2,
        why: "사진 얘기를 인물 확인으로 마쳤어요.",
        reaction: ["네 이름만 알아보면 되죠. 차까지 보일 필요는 없고."],
        next: "gear"
      },
      {
        id: "preparation",
        text: "그냥 찍은 거예요? 사진 고를 때는 오래 보셨을 것 같은데요.",
        delta: 0,
        why: "가볍다는 말과 준비 과정이 같은지 물어봤어요.",
        reaction: ["사진 세 장 골랐어요. 쿠폰 문구도 네 번 고르는 편이라.", "아 그런 건 상대가 아는 게 아닌데 ㅎㅎ"],
        remember: {giftEffort: "drafts"},
        evidence: "giftEffort",
        next: "gift"
      },
      {
        id: "afterNine",
        text: "민수 님 확인했어요. 저는 개인 톡은 아홉 시 지나서 봐요.",
        delta: -1,
        why: "평가 대신 연락을 볼 시간을 정했어요.",
        reaction: ["아홉 시 이후. 네 기다릴게요."],
        remember: {replyAt: "after9"},
        evidence: "replyTime",
        next: "gear"
      }
    ],
    next: "gear"
  },
  story: {
    intro: ["스토리 하트 눌러주셨길래 톡해봤어요. 민수예요 ㅎㅎ", "하필 제가 나온 데 눌러주셔서 무슨 뜻인가 했죠."],
    options: [
      {
        id: "track",
        text: "영상에 나온 음악이 궁금했어요. 제목 알 수 있어요?",
        delta: 0,
        why: "반응의 의미를 음악으로 설명했어요.",
        reaction: ["아 음악이었구나. 저도 제목부터 찾아볼게요."],
        remember: {story: "music"}
      },
      {
        id: "context",
        text: "하트는 잘 봤다는 뜻이었어요. 모임 영상 맞죠?",
        delta: -2,
        why: "반응을 모임 콘텐츠에 한정했어요.",
        reaction: ["네 모임 영상 맞아요. 저는 끝에 작게 나온 거고."],
        remember: {story: "group"}
      },
      {
        id: "afterNine",
        text: "잘 봤어요. 스토리는 가끔 보고 톡은 아홉 시 이후에 봐요.",
        delta: -1,
        why: "스토리 반응과 대화 시간을 구분했어요.",
        reaction: ["아홉 시 이후에 톡. 네 그때까지 기다릴게요."],
        remember: {replyAt: "after9"},
        evidence: "replyTime"
      }
    ],
    next: "playlist"
  },
  playlist: {
    intro: ["출근할 때 듣는 음악도 괜찮아요. 제목은 저도 찾아봐야겠지만.", "분위기 맞는 곡 고르는 건 자신 있어요 ㅎㅎ"],
    options: [
      {
        id: "source",
        text: "제목보다 궁금한데, 직접 고르는 기준이 있는 거예요?",
        delta: 0,
        why: "추천이 만들어지는 방식을 알아봤어요.",
        reaction: ["첫 곡 뒤에는 앱 자동추천이에요. 건너뛰는 건 제가 하고요."],
        remember: {music: "auto"},
        evidence: "music"
      },
      {
        id: "groupList",
        text: "모임에서 틀기 좋으면 목록을 단톡에 같이 올려줘요.",
        delta: -3,
        why: "취향 얘기를 모임 선곡으로 바꿨어요.",
        reaction: ["네. 목록은 한번 정리해볼게요."],
        remember: {music: "group"}
      },
      {
        id: "swap",
        text: "제가 들은 곡도 가져갈게요. 모임에서 서로 틀어봐요.",
        delta: 4,
        why: "취향을 주고받을 자리를 남겼어요.",
        reaction: ["좋죠. 서로 고른 거 들으면 어떤 사람인지 좀 알겠죠."],
        remember: {music: "shared"}
      }
    ],
    next: "compliment"
  },
  gear: {
    intro: ["어제 신은 운동화 어디 거예요? 저도 러닝화 알아보거든요.", "신발은 세 켤레인데 뛴 건 두 번이에요. 설명은 많이 봤어요 ㅎㅎ"],
    options: [
      {
        id: "criterion",
        text: "종류가 많네요. 직접 신어보고 고르는 기준은 뭐예요?",
        delta: -2,
        why: "자랑을 구체적인 경험 얘기로 바꿨어요.",
        reaction: ["발이 편한 거요. 매장에서는 다 편해서 아직 기준 찾는 중이에요."]
      },
      {
        id: "tryFit",
        text: "같이 고르기 전에 정보부터 봐요. 모임 때 자료만 알려줘요.",
        delta: -1,
        why: "개인 약속을 잡기보다 먼저 정보를 받기로 했어요.",
        reaction: ["네. 저 예약이나 이런 정보 찾는 건 빨라요."]
      },
      {
        id: "groupFit",
        text: "신발 얘기는 모임에서 같이 들어요. 다른 분들도 신던데요.",
        delta: -3,
        why: "전문 지식을 여러 사람의 경험으로 돌렸어요.",
        reaction: ["그분한테 물어보는 게 더 정확할 수도 있겠네요."]
      }
    ],
    next: "help"
  },
  help: {
    intro: ["정보 찾는 건 빨라요. 어제 장소 예약도 제가 했잖아요.", "필요한 거 있으면 저한테 물어봐요."],
    options: [
      {
        id: "splitRoles",
        text: "예약은 누가 맡고, 비용은 누가 걷는지 모임에서 정하죠.",
        delta: -4,
        why: "호의를 개인적인 빚으로 두지 않고 역할로 나눴어요.",
        reaction: ["네. 예약은 제가 했고 비용은 운영자님이 걷으셨죠."],
        remember: {roles: "shared"},
        next: "coffee"
      },
      {
        id: "booking",
        text: "예약은 어디서 했어요? 다른 사람도 같은 방식으로 하면 돼요?",
        delta: -2,
        why: "나중에 검증할 수 있는 예약 방식을 알아냈어요.",
        reaction: ["네이버 공개 예약이에요. 누구나 하는 거예요.", "제가 먼저 빈 자리 본 것뿐이죠."],
        remember: {booking: "public"},
        evidence: "booking",
        next: "meal"
      },
      {
        id: "independent",
        text: "정보는 받아둘게요. 예약이나 개인 일정은 제가 정할게요.",
        delta: -5,
        why: "정보와 약속의 결정권을 구분했어요.",
        reaction: ["네 링크만 드릴게요. 그걸로 보세요."],
        remember: {activityOnly: true},
        next: "coffee"
      }
    ],
    next: "coffee"
  },
  coffee: {
    intro: ["새 카페, 제가 가면 창가 자리를 봐주더라고요.", "다음 모임 전에 가볼래요? 일단 두 명으로 생각했는데."],
    options: [
      {
        id: "menu",
        text: "자리 정하기 전에 메뉴랑 예약 방식부터 볼게요.",
        delta: 0,
        why: "약속을 확정하지 않고 조건을 확인했어요.",
        reaction: ["예약은 없어요. 오픈하면 누구나 창가 앉는 거예요."],
        remember: {booking: "public", invitation: "coffee"},
        evidence: "booking",
        next: "snack"
      },
      {
        id: "groupCoffee",
        text: "모임 끝나고 갈 사람부터 물어봐요. 인원 모이면 가죠.",
        delta: -3,
        why: "개인 제안을 단체 일정 협의로 바꿨어요.",
        reaction: ["그럼 다 같이... 사람 더 오는지부터 봐야겠네요."],
        remember: {plan: "coffee"},
        next: "groupPlan"
      },
      {
        id: "decline",
        text: "둘이 따로 갈 생각은 없어요. 모임에서만 봬요.",
        delta: -12,
        why: "둘만의 만남을 거절했어요.",
        reaction: ["네 둘이 가는 건 안 하는 걸로.", "사실 저도 그 집은 혼자 한 번 가본 거예요."],
        remember: {meal: "declined"},
        next: "snack"
      }
    ],
    variants: [
      {
        when: {booking: "public"},
        options: [
          {
            id: "quoteBooking",
            text: "누구나 가는 창가라면서요. 따로 잡아둔 자리가 있는 거예요?",
            delta: -2,
            why: "공개 이용 조건으로 특별 대우를 확인했어요.",
            reaction: ["잡아둔 건 아니에요. 먼저 가면 앉는 거죠."],
            remember: {proofUsed: "booking"},
            uses: "booking",
            next: "claimCheck"
          },
          {
            id: "groupCoffee",
            text: "모임 끝나고 갈 사람부터 물어봐요. 인원 모이면 가죠.",
            delta: -3,
            why: "개인 제안을 단체 일정 협의로 바꿨어요.",
            reaction: ["그럼 다 같이... 사람 더 오는지부터 봐야겠네요."],
            remember: {plan: "coffee"},
            next: "groupPlan"
          },
          {
            id: "decline",
            text: "둘이 따로 갈 생각은 없어요. 모임에서만 봬요.",
            delta: -12,
            why: "둘만의 만남을 거절했어요.",
            reaction: ["네 둘이 가는 건 안 하는 걸로.", "사실 저도 그 집은 혼자 한 번 가본 거예요."],
            remember: {meal: "declined"},
            next: "snack"
          }
        ]
      }
    ],
    next: "snack"
  },
  snack: {
    intro: [
      {
        when: {meal: "declined"},
        lines: ["커피 약속은 안 잡는 걸로 알겠어요.", "디저트만 답례로 보내도 돼요? 아직 주문은 안 했어요."]
      },
      {
        lines: ["카페 디저트 배달이 되네요. 정리 도와준 답례로 보낼까요?", "아무 뜻 없이 보내는 거예요. 좋아하는 것만 알려줘요."]
      }
    ],
    options: [
      {
        id: "plainThanks",
        text: "어제 정리는 다 같이 했어요. 감사 인사는 단톡에 같이 해요.",
        delta: -3,
        why: "답례를 모임 전체에 대한 인사로 돌렸어요.",
        reaction: ["네 따로 보내진 않을게요."],
        remember: {gift: "declined", giftKind: "snack"}
      },
      {
        id: "organizer",
        text: "모임 간식으로 바꿀 거면 전체 인원부터 세어봐요.",
        delta: -1,
        why: "선물을 단체 준비로 전환하기 시작했어요.",
        reaction: ["전체요? 저는 한 개만 보고 있었는데."],
        remember: {plan: "snacks", gift: "group"},
        next: "groupPlan"
      },
      {
        id: "note",
        text: "아무 뜻 없다면서요. 메뉴는 언제부터 골라놓은 거예요?",
        delta: 0,
        why: "말과 준비한 정도가 같은지 확인했어요.",
        reaction: ["어제 집에 와서요. 문구도 몇 번 골랐고.", "아직 결제 안 했어요. 장바구니만 좀 오래 보고 있었지 ㅎㅎ"],
        remember: {giftEffort: "drafts", gift: "pending"},
        evidence: "giftEffort",
        next: "status"
      }
    ],
    next: "reminder"
  },
  status: {
    intro: ["아무 뜻 없다 해놓고 문구 고른 얘기까지 했네요.", "대충 보내는 사람처럼 보이려던 건 맞아요. 결제는 아직이에요."],
    options: [
      {
        id: "withdraw",
        text: "그럼 이번 건 취소해요. 개인 답례 없이 모임 지인으로 지낼게요.",
        delta: -6,
        why: "호의를 거절하고 관계도 정리했어요.",
        reaction: ["네 취소할게요. 장바구니에서 빼면 돼요.", "제가 먹을 거까지 빼버렸네."],
        remember: {scope: "closed", gift: "declined"},
        uses: "giftEffort",
        end: "settled"
      },
      {
        id: "groupGift",
        text: "의미를 빼려면 모임 간식으로 바꿔요. 누구 한 명한테 말고요.",
        delta: -3,
        why: "선물을 전체 모임의 간식으로 바꾸기로 했어요.",
        reaction: ["네 운영자님께 전체 간식으로 물어볼게요."],
        remember: {scope: "group", gift: "group"},
        uses: "giftEffort",
        end: "group"
      },
      {
        id: "privateEnd",
        text: "준비한 마음은 들었어요. 선물과 개인 연락은 여기서 끝낼게요.",
        delta: -8,
        why: "선물의 의미를 확인한 뒤 연락을 종료했어요.",
        reaction: ["알겠어요. 보내지 않고 개인 톡도 끝낼게요."],
        remember: {scope: "closed", gift: "declined"},
        uses: "giftEffort",
        end: "quiet"
      }
    ]
  },
  groupPlan: {
    intro: ["다 같이 가는 거면 모임 끝나고 잡을까요?", "다른 분들한텐 안 물어봤어요. 지금 확정은 저희 둘이긴 한데."],
    options: [
      {
        id: "putOnPoll",
        text: "단톡에서 참석 먼저 받아요. 둘뿐이면 이번엔 안 잡아요.",
        delta: -4,
        why: "개인 약속으로 되돌아갈 여지도 닫았어요.",
        reaction: ["네 참석 투표부터 올릴게요. 둘만 가는 건 안 잡고요."],
        remember: {scope: "group"},
        end: "group"
      },
      {
        id: "askQuorum",
        text: "몇 명부터 모임으로 볼 거예요? 최소 인원부터 정하죠.",
        delta: -1,
        why: "단체라는 말의 실제 조건을 확인했어요.",
        reaction: ["세 명 이상이요. 둘만 가는 건 빼고.", "다음 개인 연락도 그렇게 구분하면 되죠?"],
        remember: {quorum: "three"},
        next: "last"
      },
      {
        id: "leaveOrganizer",
        text: "예약과 인원은 운영자에게 넘겨요. 저는 개인 약속 안 잡아요.",
        delta: -5,
        why: "개인적으로 약속을 잡는 역할을 끝냈어요.",
        reaction: ["네 운영자님께 넘길게요. 제가 따로 잡지는 않고요."],
        remember: {scope: "closed"},
        end: "settled"
      }
    ],
    variants: [
      {
        when: {plan: "snacks"},
        intro: ["모임 간식이면 전부 몇 명이죠? 저는 한 개만 골라놓긴 했어요.", "아무한테나 잘 보낸다 해놓고 하나만 봤네."],
        options: [
          {
            id: "putOnPoll",
            text: "전체 간식으로 단톡에 물어봐요. 개인 선물은 빼고요.",
            delta: -4,
            why: "선물의 받을 사람과 전달 경로를 바꿨어요.",
            reaction: ["네 전체 간식으로 운영자님께 물어볼게요."],
            remember: {scope: "group", gift: "group"},
            end: "group"
          },
          {
            id: "checkEveryone",
            text: "한 개라면서요. 전체 간식이면 누구 주려고 고른 건데요?",
            delta: -1,
            why: "말과 준비한 수량의 모순을 확인했어요.",
            reaction: ["그건... 원래 한 분 드리려고 본 거예요. 문구까지 골랐고."],
            remember: {giftEffort: "drafts"},
            evidence: "giftEffort",
            next: "status"
          },
          {
            id: "leaveOrganizer",
            text: "간식은 운영자하고 정해요. 제 개인 선물은 받지 않을게요.",
            delta: -5,
            why: "단체 간식과 개인 선물을 구분했어요.",
            reaction: ["네 개인적으로 안 보낼게요."],
            remember: {scope: "closed", gift: "declined"},
            end: "settled"
          }
        ]
      },
      {
        when: {booking: "public"},
        options: [
          {
            id: "putOnPoll",
            text: "단톡에서 참석 먼저 받아요. 둘뿐이면 이번엔 안 잡아요.",
            delta: -4,
            why: "개인 약속으로 되돌아갈 여지도 닫았어요.",
            reaction: ["네 참석 투표부터 올릴게요. 둘만 가는 건 안 잡고요."],
            remember: {scope: "group"},
            end: "group"
          },
          {
            id: "quoteBooking",
            text: "아까 공개 예약이라면서요. 단골 예약은 따로 있는 거예요?",
            delta: -2,
            why: "공개 예약이라는 정보를 단골 자랑과 대조했어요.",
            reaction: ["따로 있는 건 아닌데... 예약 화면 보면서 얘기할까요."],
            remember: {proofUsed: "booking"},
            uses: "booking",
            next: "claimCheck"
          },
          {
            id: "leaveOrganizer",
            text: "예약과 인원은 운영자에게 넘겨요. 저는 개인 약속 안 잡아요.",
            delta: -5,
            why: "개인적으로 약속을 잡는 역할을 끝냈어요.",
            reaction: ["네 운영자님께 넘길게요. 제가 따로 잡지는 않고요."],
            remember: {scope: "closed"},
            end: "settled"
          }
        ]
      },
      {
        when: {plan: "notice"},
        intro: ["네 공지는 단톡에만 올릴게요.", "다음 모임 장소도 거기서 같이 고르면 되는 거죠?"]
      }
    ],
    next: "last"
  },
  claimCheck: {
    intro: ["예약 화면 보니까 성함부터 입력하게 되어 있네요.", "사장님이 저를 아시는 게 아니라... 지난번 예약 이름을 읽어주신 거였나 봐요."],
    options: [
      {
        id: "checkName",
        text: "그럼 특별 예약은 아닌 거네요. 다음엔 링크만 공유해요.",
        delta: -5,
        why: "자랑과 실제 예약 화면이 다르다는 걸 확인했어요.",
        reaction: ["네. 사장님 연락처가 있는 것도 아니고... 링크만 올릴게요."],
        remember: {scope: "closed"},
        uses: "booking",
        end: "bluff"
      },
      {
        id: "tableAsGroup",
        text: "다들 똑같이 예약할 수 있네요. 모임 인원대로 잡으면 되겠어요.",
        delta: -3,
        why: "공개 정보를 단체 일정으로 돌렸어요.",
        reaction: ["네 모임 인원대로만 볼게요."],
        remember: {scope: "group"},
        uses: "booking",
        end: "group"
      },
      {
        id: "leaveBooking",
        text: "예약은 제가 확인했어요. 개인 약속은 더 안 잡을게요.",
        delta: -6,
        why: "정보를 확인한 뒤 개인 제안을 종료했어요.",
        reaction: ["네 제가 더 알아보진 않을게요."],
        remember: {scope: "closed"},
        uses: "booking",
        end: "settled"
      }
    ],
    variants: [
      {
        when: {proofUsed: "music"},
        intro: ["선곡자라고 하기엔 첫 곡 뒤에는 앱이 다 골랐어요.", "첫 곡도 검색해서 누른 거긴 하고요. 볼륨은 제가 맞췄죠."],
        options: [
          {
            id: "letAppCredit",
            text: "그럼 선곡은 앱으로 적을게요. 민수 님은 볼륨 담당이네요.",
            delta: -5,
            why: "민수가 인정한 역할까지만 남겼어요.",
            reaction: ["네. 볼륨... 그건 제가 했어요."],
            remember: {scope: "closed"},
            uses: "music",
            end: "bluff"
          },
          {
            id: "shareRecipe",
            text: "첫 곡만 누르면 되는 거네요. 다음엔 모임에서 같이 틀어요.",
            delta: -3,
            why: "특별한 취향 영업을 누구나 쓰는 방법으로 바꿨어요.",
            reaction: ["네 단톡에 첫 곡이랑 앱 이름 올릴게요."],
            remember: {scope: "group"},
            uses: "music",
            end: "group"
          },
          {
            id: "endPitch",
            text: "방법은 알았어요. 따로 추천 받는 얘기는 여기까지 할게요.",
            delta: -6,
            why: "정보를 얻은 뒤 개인 추천 대화를 정리했어요.",
            reaction: ["네. 따로 보내지는 않을게요."],
            remember: {scope: "closed"},
            uses: "music",
            end: "settled"
          }
        ]
      },
      {
        when: {invitation: "coffee"},
        intro: ["창가 지정은 안 된대요. 오픈할 때 먼저 오는 순서라고.", "저한테 자리를 봐준 게 아니라... 제가 오픈 전에 서 있었나 봐요."],
        options: [
          {
            id: "checkName",
            text: "그럼 자리 비결은 일찍 서 있기네요. 다음엔 위치만 공유해요.",
            delta: -5,
            why: "특별 대우 대신 선착순이라는 사실을 확인했어요.",
            reaction: ["네. 저보다 일찍 오면 저도 못 앉아요."],
            remember: {scope: "closed"},
            uses: "booking",
            end: "bluff"
          },
          {
            id: "tableAsGroup",
            text: "자리 남으면 다 같이 앉죠. 모임 끝나고 가는 걸로 해요.",
            delta: -3,
            why: "창가 제안을 단체 일정으로 바꿨어요.",
            reaction: ["네. 자리 없으면 다 같이 다른 데 가죠."],
            remember: {scope: "group"},
            uses: "booking",
            end: "group"
          },
          {
            id: "leaveBooking",
            text: "자리 방식은 알겠어요. 둘이 가는 약속은 안 잡을게요.",
            delta: -6,
            why: "정보를 확인한 뒤 개인 약속은 정리했어요.",
            reaction: ["네. 제가 먼저 가서 기다리진 않을게요."],
            remember: {scope: "closed"},
            uses: "booking",
            end: "settled"
          }
        ]
      }
    ]
  }
};

export const endings = {
  quiet: {
    title: "알림이 평화로워졌습니다",
    copy: "사적인 연락을 종료했어요. 마지막 종료 요청이 반영됐고 이후 메시지는 오지 않습니다.",
    reaction: []
  },
  group: {
    title: "단톡에서만 봐요",
    copy: "모임 일정과 대화는 단톡에서만 이어가기로 했어요. 민수의 호감도는 {score}점 남았고, 둘만의 약속은 잡지 않습니다.",
    reaction: []
  },
  bluff: {
    title: "아는 사람은 검색창",
    copy: [
      {
        when: {proofUsed: "music"},
        lines: ["자동추천이라는 단서를 되돌려 주자 민수가 선곡 자랑을 접었어요. 볼륨은 본인이 맞췄다고 마지막으로 덧붙였습니다."]
      },
      {
        when: {invitation: "coffee"},
        lines: ["창가 특별 대우를 확인하니 누구나 선착순이었어요. 민수는 자리를 잡아준 게 아니라 일찍 줄을 선 사람이었습니다."]
      },
      {
        lines: ["공개 예약 화면을 확인하자 민수가 단골 대우 자랑을 접었어요. 사장님이 읽은 건 예약자 이름이었습니다."]
      }
    ],
    reaction: []
  },
  settled: {
    title: "마음은 남고 선은 생겼다",
    copy: "민수의 호감도는 {score}점으로 남았고, 개인 약속과 사적인 접근은 끝냈어요. 민수도 더 권하지 않기로 했어요.",
    reaction: []
  },
  crush: {
    title: "상대만 썸 타는 중",
    copy: "오늘 대화는 마쳤지만 다음 개인 약속을 다시 얘기할 가능성은 남겼어요. 민수의 기대는 {score}점입니다. 연락 종료나 단체 관계 합의는 아직 하지 않았어요.",
    reaction: []
  }
};
