class CreateLenguaje:

    def __init__(self, repository):
        self.repository = repository

    def execute(self, lenguaje_data):
        return self.repository.create(lenguaje_data)