export const inferGender = async (name: string): Promise<string | null> => {
  try {
    const firstName = name.split(' ')[0];
    const res = await fetch(`https://api.genderize.io/?name=${firstName}`);
    const data = await res.json();
    return data.gender;
  } catch (err) {
    console.error('Erro ao inferir gênero:', err);
    return null;
  }
};
