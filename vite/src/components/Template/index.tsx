import { Link } from 'react-router-dom'

export const Template = () => {
  const promptTemplates = [
    'MR一覧: 「poker」というプロジェクトのマージリクエストを見せて',
    'MR作成: 「poker」のリポジトリの「test」ブランチから「master」ブランチ向けにマージリクエストを作成してください。タイトルは「title_test」で、説明は「description_test」にしてください。',
    'コミット一覧: 「poker」のリポジトリのtestブランチのコミット一覧を見たい',
    'リバート: 「poker」のリポジトリのtestブランチの「revert」というコミット名のコミットをリバートしてください。',
    'ブランチ一覧: 「poker」のリポジトリのブランチ一覧を見せて',
    'ブランチ作成: 「poker」のリポジトリのnew_branchブランチから「new_test_branch」というブランチを作成してください。',
    'ブランチ削除: 「poker」のリポジトリの「new_test_branch」というブランチを削除してください。',
    'ファイル作成: 「poker」のリポジトリの「test」というブランチにconsole.tsを作成してください。中身は「console.log("Hello")」です。ファイルのパスはconsole.tsです。コミットメッセージ名は「Hello表示ファイル」です。',
    'ファイル削除: 「poker」のリポジトリの「test」というブランチのindex.tsを削除してください。ファイルのパスはindex.tsです。コミットメッセージ名は「index.ts削除」です。',
  ];
  return (
    <div className="container mx-auto mt-8">
      <Link to="/" className="mb-4 inline-block">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Home
        </button>
      </Link>
      <ul>
        {promptTemplates.map((template, index) => (
          <li key={index} className="bg-gray-100 p-4 my-2 rounded-md shadow">
            {template}
          </li>
        ))}
      </ul>
    </div>
  );
};
