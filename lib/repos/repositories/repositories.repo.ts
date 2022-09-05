import Repository from '../../entities/Repository';

export default interface IRepositoriesRepo {
  findById(id: string): Promise<Repository | undefined>;
  findByName(name: string): Promise<Repository | undefined>;
  save(repo: Repository | Repository[]): Promise<void>;
}
