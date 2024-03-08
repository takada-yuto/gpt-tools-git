import { Link } from 'react-router-dom'

export const Template = () => {
  const promptTemplates = [
    '「poker」というプロジェクトのマージリクエストを見せて',
    '「poker」のリポジトリの「test」ブランチから「master」ブランチ向けにマージリクエストを作成してください。タイトルは「title_test」で、説明は「description_test」にしてください。',
    '「poker」のリポジトリのtestブランチのコミット一覧を見たい',
    '「poker」のリポジトリのtestブランチの「revert」というコミット名のコミットをリバートしてください。',
    '「poker」のリポジトリのブランチ一覧を見せて',
    '「poker」のリポジトリのnew_branchブランチから「new_test_branch」というブランチを作成してください。',
    '「poker」のリポジトリの「new_test_branch」というブランチを削除してください。',
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
