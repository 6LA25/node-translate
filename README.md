## json语言包翻译工具

### 执行命令
```
node translate.js lang
```

```lang```需要翻译的目标语种，参考：[百度翻译api文档](https://fanyi-api.baidu.com/doc/21)

---

### 中文json文件定义格式规范

**仅支持一级或二级子对象，对象字段数字尽可能限制在40个以内**

**good**✅
``` json
{
  "student": {
    "group": {
      "myTeam": "我的团队",
      "moreTeam": "更多团队",
      "myNew": "我创建的",
      "member": "个成员",
      "active": "次活动",
    },
    "survey": {
      "enter": "进入问卷",
      "result": "查看结果",
      "surveyEnd": "问卷已结束！",
      "surveyResults": "调查结果统计",
      "surveyName": "调查名称"
    }
  },
  "lecturer": {
    "agenda": "我的议程",
    "support": "最大支持",
    "percent": "通过百分比（%）",
    "insideLetter": "站内信",
    "message": "短信",
    "mail": "邮件",
    "participation": "全程参与培训",
    "passExam": "通过考试",
    "questionnaire": "完成问卷调查",
    "teachTime": "授课时间",
    "comprehensive": "综合评分",
    "people": "人打分",
    "disableTrain": "培训已结束，无法再编辑！"
  }
}
```

**error**❎
``` json
{
  "student": {
    "myTeam": {
      "x": 1
    }
  },
  "lecturer": {
    "agenda": "我的议程",
    "support": "最大支持",
    "child": {
      "x": 1
    }
  }
}
```
