import { ChatCompletionsFunctionToolDefinition } from "@azure/openai/types/src"

export const TOOLS: ChatCompletionsFunctionToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "getMergeRequests",
      description:
        "指定されたGitのプロジェクト名からそのプロジェクトのマージリクエスト一覧の情報を取得する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
        },
        required: ["project_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createMergeRequests",
      description: "指定されたGitプロジェクトでマージリクエストを作成する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          source_branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          target_branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          title: {
            type: "string",
            description:
              "マージリクエストの名前 (例:リファクタリング、DB設計, 作成、テストコンポーネント作成、テスト修正)",
          },
          description: {
            type: "string",
            description:
              "マージリクエストの名前 (例:チケット参照、DB作成のみです、まだマージしないでください)",
          },
        },
        required: ["project_name", "source_branch", "target_branch", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listCommits",
      description: "指定されたGitプロジェクトのコミット一覧を取得する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
        },
        required: ["project_name", "branch"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "revertCommit",
      description:
        "指定されたGitプロジェクトの指定されたshaもしくは指定されたコミット名からコミットをリバートする。shaもしくはコミット名の値が無い場合はnullを入れる",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          commit_name: {
            type: ["string", "null"],
            description:
              "コミットの名前 値がない場合はnullを入れる (例:Update .env.sample、first commit、setup構文に変更、リファクタリング)",
          },
          sha: {
            type: ["string", "null"],
            description:
              "sha 値がない場合はnullを入れる (例:a738f717824ff53aebad8b090c1b79a14f2bd9e8、18f3e63d05582537db6d183d9d557be09e1f90c8)",
          },
        },
        required: ["project_name", "branch"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listBranches",
      description: "指定されたGitプロジェクトのブランチ一覧を取得する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
        },
        required: ["project_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createBranches",
      description:
        "指定されたGitプロジェクトの指定されたブランチから新しいブランチを作成する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          new_branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          source_bransh: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
        },
        required: ["project_name", "new_branch", "source_bransh"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteBranches",
      description: "指定されたGitプロジェクトの指定されたブランチを削除する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          delete_branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
        },
        required: ["project_name", "delete_branch"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchGroupId",
      description: "指定されたGitグループののグループidを取得する",
      parameters: {
        type: "object",
        properties: {
          group_name: {
            type: "string",
            description:
              "Gitグループの名前 (例:NBI オフラベル、AIシステム部、prototype)",
          },
        },
        required: ["group_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createFile",
      description:
        "指定されたGitプロジェクトに、指定された内容でファイルを作成する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          content: {
            type: "string",
            description: "ファイルの内容",
          },
          file_path: {
            type: "string",
            description:
              "作成するファイルの絶対パス (例:app/index.html、app/hooks/useGetInfo.ts、.env、package.json)",
          },
          branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          commit_message: {
            type: "string",
            description:
              "コミットメッセージ名 (例:Update .env.sample、first commit、setup構文に変更、リファクタリング)",
          },
        },
        required: ["project_name", "file_path", "branch", "commit_message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteFile",
      description: "指定されたGitプロジェクトの指定されたファイルを削除する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          file_path: {
            type: "string",
            description:
              "削除するファイルのパス (例:app/index.html、app/hooks/useGetInfo.ts、.env、package.json)",
          },
          branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          commit_message: {
            type: "string",
            description:
              "コミットメッセージ名 (例:Update .env.sample、first commit、setup構文に変更、リファクタリング)",
          },
        },
        required: ["project_name", "file_path", "branch", "commit_message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateFile",
      description:
        "指定されたGitプロジェクトで、指定された編集前の内容から指定された編集後の内容にファイルを編集する",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              "Gitプロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
          },
          source_content: {
            type: "string",
            description: "編集前のファイルの該当箇所",
          },
          target_content: {
            type: "string",
            description: "編集後のファイルの該当箇所",
          },
          file_path: {
            type: "string",
            description:
              "削除するファイルのパス (例:app/index.html、app/hooks/useGetInfo.ts、.env、package.json)",
          },
          branch: {
            type: "string",
            description:
              "ブランチの名前 (例:master、develop、feature/12345、feature/test)",
          },
          commit_message: {
            type: "string",
            description:
              "コミットメッセージ名 (例:Update .env.sample、first commit、setup構文に変更、リファクタリング)",
          },
        },
        required: [
          "project_name",
          "source_content",
          "target_content",
          "file_path",
          "branch",
          "commit_message",
        ],
      },
    },
  },
]
