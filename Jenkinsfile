// pipeline {
//   agent any
//   stages {
//     stage('Hello') {
//       steps {
//         echo 'Hello new version!'
//       }
//     }
//   }
// }
// https://github.com/khushboormeshram/jenkins-demo

pipeline {
    agent any

    environment {
        IMAGE_NAME = "khushboorm/cep" // lowercase is safer
        IMAGE_TAG = "1.0.0"
    }

    stages {

        stage('Try') {
            steps {
                echo "hello i have started"
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'docker-branch', url: 'https://github.com/khushboorm/jenkins-demo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    def customImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    env.IMAGE_ID = customImage.id
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'root') {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                    }
                }
            }
        }
    }

    post {
        success { echo "Docker image successfully built and pushed 🚀" }
        failure { echo "Pipeline failed ❌" }
    }
}